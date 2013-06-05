/** An implementation of a finite state machine. */
myt.StateMachine = new JS.Class('StateMachine', myt.Node, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.map = {};
        this.map[myt.StateMachine.WILDCARD] = {};
        
        this.current = '';
        this.initial = '';
        this.terminal = '';
        this.__resetTransitionProgress();
        
        this.callSuper(parent, attrs);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setInitialState: function(v) {
        if (this.current === '') {
            // Get optional args if v is an array
            var args = [];
            if (v instanceof Array) {
                args = v;
                v = args.shift();
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
        var i = v.length;
        var data;
        while (i) {
            data = v[--i];
            this.addTransition(data.name, data.from, data.to);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    addTransition: function(transition, from, to) {
        var map = this.map;
        
        if (!from) {
            from = [myt.StateMachine.WILDCARD];
        } else {
            from = from instanceof Array ? from : [from];
        }
        
        var i = from.length;
        var mapEntry;
        while (i) {
            mapEntry = map[from[--i]];
            if (!mapEntry) mapEntry = map[from[i]] = {};
            mapEntry[transition] = to;
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
        
        var async = args.shift();
        var transition = args.shift();
        
        // Invalid to start a transition if one is still pending.
        if (this.__pendingTransition) return myt.StateMachine.PENDING;
        
        // Do not allow transition from the terminal states
        if (this.isFinished()) {
            this.__transitionInProgress = false;
            return myt.StateMachine.NO_TRANSITION;
        }
        
        var to = this.map[this.current][transition];
        if (!to) to = this.map[myt.StateMachine.WILDCARD][transition];
        if (to) {
            this.__pendingTransition = transition;
            this.__transitionDestinationState = to;
            this.__additionalArgs = args;
            return this.resumeTransition(async);
        } else {
            this.__transitionInProgress = false;
            return myt.StateMachine.NO_TRANSITION;
        }
    },
    
    resumeTransition: function(async) {
        var transition = this.__pendingTransition;
        
        // Invalid to resume a transition if none is pending.
        if (!transition) return myt.StateMachine.INVALID;
        
        var current = this.current;
        var to = this.__transitionDestinationState;
        var args = this.__additionalArgs;
        var eventValue = {name:transition, from:current, to:to, args:args};
        
        switch (this.__transitionStage) {
            case 'leaveState':
                var result = this.doLeaveState(transition, current, to, args);
                if (result === false) {
                    this.__resetTransitionProgress();
                    this.__doDeferredTransitions();
                    return myt.StateMachine.CANCELLED;
                } else if (result === myt.StateMachine.ASYNC || async === myt.StateMachine.ASYNC) {
                    this.__transitionStage = 'enterState';
                    this.fireNewEvent('start' + transition, eventValue);
                    this.fireNewEvent('start', eventValue);
                    this.fireNewEvent('leave' + current, eventValue);
                    this.fireNewEvent('leave', eventValue);
                    this.__doDeferredTransitions();
                    return myt.StateMachine.PENDING;
                } else {
                    this.fireNewEvent('start' + transition, eventValue);
                    this.fireNewEvent('start', eventValue);
                    this.fireNewEvent('leave' + current, eventValue);
                    this.fireNewEvent('leave', eventValue);
                }
            case 'enterState':
                this.current = to;
                this.__resetTransitionProgress();
                this.doEnterState(transition, current, to, args);
                this.fireNewEvent('enter' + to, eventValue);
                this.fireNewEvent('enter', eventValue);
                this.fireNewEvent('end' + transition, eventValue);
                this.fireNewEvent('end', eventValue);
                if (this.isFinished()) this.fireNewEvent('finished', eventValue);
        }
        
        this.__doDeferredTransitions();
        return myt.StateMachine.SUCCEEDED;
    },
    
    __doDeferredTransitions: function() {
        this.__transitionInProgress = false;
        
        var deferredTransitions = this.__deferredTransitions;
        if (deferredTransitions) {
            while(deferredTransitions.length > 0) {
                this.__doTransition.apply(this, deferredTransitions.pop());
            }
        }
    },
    
    doLeaveState: function(transition, from, to, args) {
        // Subclasses to implement as needed.
    },
    
    doEnterState: function(transition, from, to, args) {
        // Subclasses to implement as needed.
    },
    
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
        if (stateName instanceof Array) {
            return stateName.indexOf(this.current) >= 0;
        } else {
            return this.current === stateName;
        }
    },
    
    can: function(transition) {
        if (this.map[this.current][transition] !== undefined) {
            return true;
        } else {
            return this.map[myt.StateMachine.WILDCARD][transition] !== undefined;
        }
    }
});

// Class Attributes ////////////////////////////////////////////////////////////
myt.StateMachine.SUCCEEDED = 1; // The transition was successfull
myt.StateMachine.CANCELLED = 2; // The transition was cancelled before the state change occurred.
myt.StateMachine.PENDING = 3; // An asynchronous transition is in progress.
myt.StateMachine.INVALID = 4; // The transition was invalid in some way.
myt.StateMachine.NO_TRANSITION = 5; // No transition exists for the current state.

myt.StateMachine.SYNC = 'sync'; // Indicates a synchronous transition
myt.StateMachine.ASYNC = 'async'; // Indicates an asynchronous transition
myt.StateMachine.WILDCARD = '*'; // Special state name that holds transitions for all states.
