(pkg => {
    const isArray = Array.isArray,
        
        /*  Indicates a synchronous transition. */
        SYNC = 'sync',
        
        /*  Indicates an asynchronous transition. */
        ASYNC = 'async',
        
        /*  Indicates the transition was successfull. */
        SUCCEEDED = 1,
        
        /*  Indicates the transition was cancelled before the state 
            change occurred. */
        CANCELLED = 2,
        
        /*  Indicates an asynchronous transition is in progress. */
        PENDING = 3,
        
        /*  Indicates the transition was invalid in some way. */
        INVALID = 4,
        
        /* Indicates no transition exists for the current state. */
        NO_TRANSITION = 5,
        
        /*  Special state name that holds transitions for all states. */
        WILDCARD = '*',
        
        resetTransitionProgress = stateMachine => {
            stateMachine.__additionalArgs = [];
            stateMachine.__pendingTransition = '';
            stateMachine.__transDestinationState = '';
            stateMachine.__transStage = 'leaveState';
        },
        
        doTheTransition = (stateMachine, args) => {
            // Don't allow another transition if one is already in 
            // progress. Instead, defer them until after the current 
            // transition completes.
            if (stateMachine.__transInProgress) {
                let deferredTransitions = stateMachine.__deferredTransitions;
                if (!deferredTransitions) deferredTransitions = stateMachine.__deferredTransitions = [];
                deferredTransitions.unshift(args);
            } else {
                stateMachine.__transInProgress = true;
                
                const async = args.shift(),
                    transitionName = args.shift();
                
                // Invalid to start a transition if one is still pending.
                if (stateMachine.__pendingTransition) return PENDING;
                
                // Do not allow transition from the terminal states
                if (stateMachine.isFinished()) {
                    stateMachine.__transInProgress = false;
                    return NO_TRANSITION;
                }
                
                let to = stateMachine.map[stateMachine.current][transitionName];
                if (!to) to = stateMachine.map[WILDCARD][transitionName];
                if (to) {
                    stateMachine.__pendingTransition = transitionName;
                    stateMachine.__transDestinationState = to;
                    stateMachine.__additionalArgs = args;
                    return stateMachine.resumeTransition(async);
                } else {
                    stateMachine.__transInProgress = false;
                    return NO_TRANSITION;
                }
            }
        },
        
        doDeferredTransitions = stateMachine => {
            stateMachine.__transInProgress = false;
            
            const deferredTransitions = stateMachine.__deferredTransitions;
            if (deferredTransitions) {
                while (deferredTransitions.length > 0) doTheTransition(stateMachine, deferredTransitions.pop());
            }
        };
    
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
            __transInProgress:boolean Indicates that a transition is 
                currently under way.
            __pendingTransition:string The name of the transition that is 
                currently under way.
            __additionalArgs:array An array of additional args passed into the
                doTransition or doAsyncTransition methods.
            __transDestinationState: The state the currently running 
                transition is transitioning to
            __transStage:string The stage of the current transition. Allowed
                values are 'leaveState' and 'enterState'.
            __deferredTransitions:array An array of transitions that will be
                performed after the current one completes.
        
        @class */
    pkg.StateMachine = new JS.Class('StateMachine', pkg.Node, {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            /** The transition was successfull. */
            SUCCEEDED:SUCCEEDED,
            /** The transition was cancelled before the state change 
                occurred. */
            CANCELLED:CANCELLED,
            /** An asynchronous transition is in progress. */
            PENDING:PENDING,
            /** The transition was invalid in some way. */
            INVALID:INVALID,
            /** No transition exists for the current state. */
            NO_TRANSITION:NO_TRANSITION
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        initNode: function(parent, attrs) {
            this.map = {};
            this.map[WILDCARD] = {};
            
            this.current = this.initial = this.terminal = '';
            resetTransitionProgress(this);
            
            this.callSuper(parent, attrs);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setInitialState: function(v) {
            if (this.current === '') {
                // Get optional args if v is an array
                let args;
                if (isArray(v)) {
                    args = v;
                    v = args.shift();
                } else {
                    args = [];
                }
                
                this.current = this.initial = v;
                this.doEnterState('', '', v, args);
                const eventValue = {name:'', from:'', to:v, args:args};
                this.fireEvent('enter' + v, eventValue);
                this.fireEvent('enter', eventValue);
                if (this.isFinished()) this.fireEvent('finished', eventValue);
            }
        },
        
        setTerminalState: function(v) {
            this.terminal = v;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        addTransitions: function(transitions) {
            transitions.forEach(transition => this.addTransition(...transition));
        },
        
        addTransition: function(transitionName, from, to) {
            if (from) {
                from = isArray(from) ? from : [from];
            } else {
                from = [WILDCARD];
            }
            
            const map = this.map;
            let i = from.length;
            while (i) (map[from[--i]] ??= {})[transitionName] = to;
        },
        
        doTransition: function(...args) {
            args.unshift(SYNC);
            return doTheTransition(this, args);
        },
        
        doAsyncTransition: function(...args) {
            args.unshift(ASYNC);
            return doTheTransition(this, args);
        },
        
        resumeTransition: function(async) {
            const transitionName = this.__pendingTransition;
            
            // Invalid to resume a transition if none is pending.
            if (!transitionName) return INVALID;
            
            const current = this.current,
                to = this.__transDestinationState,
                args = this.__additionalArgs,
                eventValue = {name:transitionName, from:current, to:to, args:args},
                fireEvent = this.fireEvent.bind(this);
            
            switch (this.__transStage) {
                case 'leaveState':
                    const result = this.doLeaveState(transitionName, current, to, args);
                    if (result === false) {
                        resetTransitionProgress(this);
                        doDeferredTransitions(this);
                        return CANCELLED;
                    } else if (result === ASYNC || async === ASYNC) {
                        this.__transStage = 'enterState';
                        fireEvent('start' + transitionName, eventValue);
                        fireEvent('start', eventValue);
                        fireEvent('leave' + current, eventValue);
                        fireEvent('leave', eventValue);
                        doDeferredTransitions(this); // FIXME: Is there a bug here if a transition starts in the middle of an async transition?
                        return PENDING;
                    } else {
                        fireEvent('start' + transitionName, eventValue);
                        fireEvent('start', eventValue);
                        fireEvent('leave' + current, eventValue);
                        fireEvent('leave', eventValue);
                        // Synchronous so fall through to 'enterState' case.
                    }
                case 'enterState':
                    this.current = to;
                    resetTransitionProgress(this);
                    this.doEnterState(transitionName, current, to, args);
                    fireEvent('enter' + to, eventValue);
                    fireEvent('enter', eventValue);
                    fireEvent('end' + transitionName, eventValue);
                    fireEvent('end', eventValue);
                    if (this.isFinished()) fireEvent('finished', eventValue);
            }
            
            doDeferredTransitions(this);
            return SUCCEEDED;
        },
        
        doLeaveState: (transitionName, from, to, args) => {/* Subclasses to implement as needed. */},
        
        doEnterState: (transitionName, from, to, args) => {/* Subclasses to implement as needed. */},
        
        isFinished: function() {
            return this.is(this.terminal);
        },
        
        isStarting: function() {
            return this.is(this.initial);
        },
        
        is: function(stateName) {
            if (isArray(stateName)) {
                return stateName.includes(this.current);
            } else {
                return this.current === stateName;
            }
        },
        
        can: function(transitionName) {
            if (this.map[this.current][transitionName] !== undefined) {
                return true;
            } else {
                return this.map[WILDCARD][transitionName] !== undefined;
            }
        }
    });
})(myt);
