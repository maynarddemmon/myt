/** An implementation of a finite state machine.
    
    Events:
        start + transition name: Fired when a transition starts.
        start: Fired when a transition starts after the named start event.
        leave + state name: Fired when a state is left.
        leave: Fired when a state is left after the named leave event.
        enter + state name: Fired when a state is entered.
        enter: Fired when a state is entered after the named enter event.
        end + transition name: Fired when a transition ends.
        end: Fired when a transition ends after the named end event.
        finished: Fired when the state machine has transitioned into the
            terminal state if one is defined.
    
    Attributes:
        map:object A map of state names to transition maps.
        current:string The name of the current state.
        initial:string The name of the state to start with.
        terminal:string The name of the final state from which no other
            transitions are allowed.
    
    Private Attributes:
        __transitionInProgress:boolean Indicates that a transition is 
            currently under way.
        __pendingTransition:string The name of the transition that is currently
            under way.
        __additionalArgs:array An array of additional args passed into the
            doTransition or doAsyncTransition methods.
        __transitionDestinationState: The state the currently running 
            transition is transitioning to
        __transitionStage:string The stage of the current transition. Allowed
            values are 'leaveState' and 'enterState'.
        __deferredTransitions:array An array of transitions that will be
            performed after the current one completes.
*/
myt.StateMachine = new JS.Class('StateMachine', myt.Node, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** The transition was successfull. */
        SUCCEEDED:1,
        /** The transition was cancelled before the state change occurred. */
        CANCELLED:2,
        /** An asynchronous transition is in progress. */
        PENDING:3,
        /** The transition was invalid in some way. */
        INVALID:4,
        /** No transition exists for the current state. */
        NO_TRANSITION:5,
        
        /** Indicates a synchronous transition. */
        SYNC:'sync',
        /** Indicates an asynchronous transition. */
        ASYNC:'async',
        /** Special state name that holds transitions for all states. */
        WILDCARD:'*'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.map = {};
        this.map[myt.StateMachine.WILDCARD] = {};
        
        this.current = this.initial = this.terminal = '';
        this.__resetTransitionProgress();
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setInitialState: function(v) {
        if (this.current === '') {
            // Get optional args if v is an array
            var args;
            if (Array.isArray(v)) {
                args = v;
                v = args.shift();
            } else {
                args = [];
            }
            
            this.current = this.initial = v;
            this.doEnterState('', '', v, args);
            var eventValue = {name:'', from:'', to:v, args:args};
            this.fireNewEvent('enter' + v, eventValue);
            this.fireNewEvent('enter', eventValue);
            if (this.isFinished()) this.fireNewEvent('finished', eventValue);
        }
    },
    
    setTerminalState: function(v) {
        this.terminal = v;
    },
    
    setTransitions: function(v) {
        var i = v.length, data;
        while (i) {
            data = v[--i];
            this.addTransition(data.name, data.from, data.to);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    addTransition: function(transitionName, from, to) {
        var map = this.map;
        
        if (from) {
            from = Array.isArray(from) ? from : [from];
        } else {
            from = [myt.StateMachine.WILDCARD];
        }
        
        var i = from.length, mapEntry;
        while (i) {
            mapEntry = map[from[--i]];
            if (!mapEntry) mapEntry = map[from[i]] = {};
            mapEntry[transitionName] = to;
        }
    },
    
    doTransition: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(myt.StateMachine.SYNC);
        return this.__doTransition.apply(this, args);
    },
    
    doAsyncTransition: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(myt.StateMachine.ASYNC);
        return this.__doTransition.apply(this, args);
    },
    
    /** @private */
    __doTransition: function() {
        var args = Array.prototype.slice.call(arguments);
        
        // Don't allow another transition if one is already in progress.
        // Instead, defer them until after the current transition completes.
        if (this.__transitionInProgress) {
            var deferredTransitions = this.__deferredTransitions;
            if (!deferredTransitions) deferredTransitions = this.__deferredTransitions = [];
            deferredTransitions.unshift(args);
            return;
        } else {
            this.__transitionInProgress = true;
        }
        
        var async = args.shift(),
            transitionName = args.shift();
        
        // Invalid to start a transition if one is still pending.
        var SM = myt.StateMachine;
        if (this.__pendingTransition) return SM.PENDING;
        
        // Do not allow transition from the terminal states
        if (this.isFinished()) {
            this.__transitionInProgress = false;
            return SM.NO_TRANSITION;
        }
        
        var to = this.map[this.current][transitionName];
        if (!to) to = this.map[SM.WILDCARD][transitionName];
        if (to) {
            this.__pendingTransition = transitionName;
            this.__transitionDestinationState = to;
            this.__additionalArgs = args;
            return this.resumeTransition(async);
        } else {
            this.__transitionInProgress = false;
            return SM.NO_TRANSITION;
        }
    },
    
    resumeTransition: function(async) {
        var transitionName = this.__pendingTransition;
        
        // Invalid to resume a transition if none is pending.
        var SM = myt.StateMachine;
        if (!transitionName) return SM.INVALID;
        
        var current = this.current,
            to = this.__transitionDestinationState,
            args = this.__additionalArgs,
            eventValue = {name:transitionName, from:current, to:to, args:args};
        
        switch (this.__transitionStage) {
            case 'leaveState':
                var result = this.doLeaveState(transitionName, current, to, args);
                if (result === false) {
                    this.__resetTransitionProgress();
                    this.__doDeferredTransitions();
                    return SM.CANCELLED;
                } else if (result === SM.ASYNC || async === SM.ASYNC) {
                    this.__transitionStage = 'enterState';
                    this.fireNewEvent('start' + transitionName, eventValue);
                    this.fireNewEvent('start', eventValue);
                    this.fireNewEvent('leave' + current, eventValue);
                    this.fireNewEvent('leave', eventValue);
                    this.__doDeferredTransitions(); // FIXME: Is there a bug here if a transition starts in the middle of an async transition?
                    return SM.PENDING;
                } else {
                    this.fireNewEvent('start' + transitionName, eventValue);
                    this.fireNewEvent('start', eventValue);
                    this.fireNewEvent('leave' + current, eventValue);
                    this.fireNewEvent('leave', eventValue);
                    // Synchronous so fall through to 'enterState' case.
                }
            case 'enterState':
                this.current = to;
                this.__resetTransitionProgress();
                this.doEnterState(transitionName, current, to, args);
                this.fireNewEvent('enter' + to, eventValue);
                this.fireNewEvent('enter', eventValue);
                this.fireNewEvent('end' + transitionName, eventValue);
                this.fireNewEvent('end', eventValue);
                if (this.isFinished()) this.fireNewEvent('finished', eventValue);
        }
        
        this.__doDeferredTransitions();
        return SM.SUCCEEDED;
    },
    
    /** @private */
    __doDeferredTransitions: function() {
        this.__transitionInProgress = false;
        
        var deferredTransitions = this.__deferredTransitions;
        if (deferredTransitions) {
            while(deferredTransitions.length > 0) {
                this.__doTransition.apply(this, deferredTransitions.pop());
            }
        }
    },
    
    doLeaveState: function(transitionName, from, to, args) {
        // Subclasses to implement as needed.
    },
    
    doEnterState: function(transitionName, from, to, args) {
        // Subclasses to implement as needed.
    },
    
    /** @private */
    __resetTransitionProgress: function() {
        this.__additionalArgs = [];
        this.__pendingTransition = '';
        this.__transitionDestinationState = '';
        this.__transitionStage = 'leaveState';
    },
    
    isFinished: function() {
        return this.is(this.terminal);
    },
    
    isStarting: function() {
        return this.is(this.initial);
    },
    
    is: function(stateName) {
        if (Array.isArray(stateName)) {
            return stateName.indexOf(this.current) >= 0;
        } else {
            return this.current === stateName;
        }
    },
    
    can: function(transitionName) {
        if (this.map[this.current][transitionName] !== undefined) {
            return true;
        } else {
            return this.map[myt.StateMachine.WILDCARD][transitionName] !== undefined;
        }
    }
});
