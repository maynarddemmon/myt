/** Tests if a value is "valid" or not.
    
    Attributes:
        id:string the ideally unique ID for this Validator so it can be
            stored and retreived from the myt.global.validators registry.
*/
myt.Validator = new JS.Class('Validator', {
    // Constructor /////////////////////////////////////////////////////////////
    /** Creates a new Validator
        @param id:string the ideally unique ID for a validator instance. */
    initialize: function(id) {
        this.id = id;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Tests if the value is valid or not.
        @param value:* the value to test validity for.
        @param config:Object (optional) A map of configuration values that
            can be used to augment the validation function as needed. The
            nature of this config will be specific to each Validator class.
        @param errorMessages:array (optional) Any error messages arising during
            validation will be pushed onto thiis array if it is provided.
        @returns boolean true if the value is valid, false otherwise. */
    isValid: function(value, config, errorMessages) {
        return true;
    },
    
    /** Tests if the form is valid or not.
        @param form:myt.Form the form to test validity for.
        @param config:Object (optional) A map of configuration values that
            can be used to augment the validation function as needed. The
            nature of this config will be specific to each Validator class.
        @param errorMessages:array (optional) Any error messages arising during
            validation will be pushed onto thiis array if it is provided.
        @returns boolean true if the form is valid, false otherwise. */
    isFormValid: function(form, config, errorMessages) {
        if (!config) config = {};
        config.form = form;
        
        return this.isValid(form.getValue(), config, errorMessages);
    }
});
