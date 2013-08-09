JS.Packages(function() {with(this) {
    
    // Package:myt
    var MYT_ROOT = global.MYT_ROOT || '../js/myt/';
    
    // JS.Class
    file(MYT_ROOT + '../jsclass/src/core.js').provides('JS.Class','JS.Module','JS.Singleton');
    
    // Shims and Polyfills
    var MYT_SHIM_ROOT = MYT_ROOT + 'shim/';
    file(MYT_SHIM_ROOT + 'BrowserDetect.js').provides('BrowserDetect');
    file(MYT_SHIM_ROOT + 'Console.js'      ).provides('console');
    file(MYT_SHIM_ROOT + 'json2.js'        ).provides('JSON');
    file(MYT_SHIM_ROOT + 'Object.keys.js'  ).provides('Object.keys');
    
    // Util
    var UTIL_ROOT = MYT_ROOT + 'util/';
    file(UTIL_ROOT + 'Cookie.js'  ).provides('myt.Cookie'  ).requires('myt');
    file(UTIL_ROOT + 'URI.js'     ).provides('myt.URI'     ).requires('myt');
    file(UTIL_ROOT + 'XML.js'     ).provides('myt.XML'     ).requires('myt');
    file(UTIL_ROOT + 'Geometry.js').provides('myt.Geometry').requires('myt');
    
    // Core
    var MYT_CORE_ROOT = MYT_ROOT + 'core/';
    file(MYT_CORE_ROOT + 'myt.js'            ).provides('myt'                ).requires('BrowserDetect','console','JSON','Object.keys','JS.Class','JS.Module','JS.Singleton');
    file(MYT_CORE_ROOT + 'Destructible.js'   ).provides('myt.Destructible'   ).requires('myt');
    file(MYT_CORE_ROOT + 'AccessorSupport.js').provides('myt.AccessorSupport').requires('myt');
    file(MYT_CORE_ROOT + 'Node.js'           ).provides('myt.Node'           ).requires('myt.AccessorSupport','myt.Destructible','myt.Constrainable','myt.TrackActivesPool');
    file(MYT_CORE_ROOT + 'Animator.js'       ).provides('myt.Animator'       ).requires('myt.Node','myt.global.idle','myt.Reusable');
    
    // Core : Events
    var MYT_EVENTS_ROOT = MYT_CORE_ROOT + 'events/';
    file(MYT_EVENTS_ROOT + 'Observable.js'   ).provides('myt.Observable'   ).requires('myt');
    file(MYT_EVENTS_ROOT + 'Observer.js'     ).provides('myt.Observer'     ).requires('myt.Observable');
    file(MYT_EVENTS_ROOT + 'Constrainable.js').provides('myt.Constrainable').requires('myt.Observer');
    
    // Core : Model
    var MYT_MODEL_ROOT = MYT_CORE_ROOT + 'model/';
    file(MYT_MODEL_ROOT + 'ThresholdCounter.js').provides('myt.ThresholdCounter').requires('myt.AccessorSupport','myt.Destructible','myt.Observable');
    
    file(MYT_MODEL_ROOT + 'pool/Reusable.js'        ).provides('myt.Reusable'        ).requires('myt');
    file(MYT_MODEL_ROOT + 'pool/AbstractPool.js'    ).provides('myt.AbstractPool'    ).requires('myt.Destructible','myt.Reusable');
    file(MYT_MODEL_ROOT + 'pool/SimplePool.js'      ).provides('myt.SimplePool'      ).requires('myt.AbstractPool');
    file(MYT_MODEL_ROOT + 'pool/TrackActivesPool.js').provides('myt.TrackActivesPool').requires('myt.SimplePool');
    
    // Core : View
    var MYT_VIEW_ROOT = MYT_CORE_ROOT + 'view/';
    file(MYT_VIEW_ROOT + 'DomElementProxy.js').provides('myt.DomElementProxy').requires('myt');
    file(MYT_VIEW_ROOT + 'View.js'           ).provides('myt.View'           ).requires('myt.Layout','myt.MouseObservable','myt.KeyObservable','myt.DomObserver','myt.FocusObservable','myt.Geometry');
    file(MYT_VIEW_ROOT + 'RootView.js'       ).provides('myt.RootView'       ).requires('myt.View','myt.global.roots');
    
    file(MYT_VIEW_ROOT + 'SizeToDom.js'       ).provides('myt.SizeToDom'       ).requires('myt.View');
    file(MYT_VIEW_ROOT + 'ImageSupport.js'    ).provides('myt.ImageSupport'    ).requires('myt.View');
    file(MYT_VIEW_ROOT + 'TransformSupport.js').provides('myt.TransformSupport').requires('myt.View');
    file(MYT_VIEW_ROOT + 'TextSupport.js'     ).provides('myt.TextSupport'     ).requires('myt.View','myt.SizeToDom');
    
    // Core : Dom Events
    var MYT_DOM_EVENTS_ROOT = MYT_CORE_ROOT + 'dom_events/';
    file(MYT_DOM_EVENTS_ROOT + 'DomObservable.js'  ).provides('myt.DomObservable'  ).requires('myt.DomElementProxy');
    file(MYT_DOM_EVENTS_ROOT + 'DomObserver.js'    ).provides('myt.DomObserver'    ).requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'MouseObservable.js').provides('myt.MouseObservable').requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'KeyObservable.js'  ).provides('myt.KeyObservable'  ).requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'FocusObservable.js').provides('myt.FocusObservable').requires('myt.DomObservable','myt.global.focus');
    
    // Core : Layout
    var MYT_LAYOUT_ROOT = MYT_CORE_ROOT + 'layout/';
    file(MYT_LAYOUT_ROOT + 'Layout.js'        ).provides('myt.Layout'        ).requires('myt.Node','myt.ThresholdCounter');
    file(MYT_LAYOUT_ROOT + 'ConstantLayout.js').provides('myt.ConstantLayout').requires('myt.Layout');
    file(MYT_LAYOUT_ROOT + 'VariableLayout.js').provides('myt.VariableLayout').requires('myt.ConstantLayout');
    
    // Core : Globals
    var MYT_GLOBALS_ROOT = MYT_CORE_ROOT + 'globals/';
    file(MYT_GLOBALS_ROOT + 'Global.js'                ).provides('myt.global'             ).requires('myt.Constrainable');
    file(MYT_GLOBALS_ROOT + 'GlobalIdle.js'            ).provides('myt.global.idle'        ).requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalMouse.js'           ).provides('myt.global.mouse'       ).requires('myt.global','myt.DomObservable','myt.MouseObservable');
    file(MYT_GLOBALS_ROOT + 'GlobalFocus.js'           ).provides('myt.global.focus'       ).requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalKeys.js'            ).provides('myt.global.keys'        ).requires('myt.global','myt.DomObserver','myt.KeyObservable','myt.global.focus','myt.Observer');
    file(MYT_GLOBALS_ROOT + 'GlobalDragManager.js'     ).provides('myt.global.dragManager' ).requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalWindowResize.js'    ).provides('myt.global.windowResize').requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalRootViewRegistry.js').provides('myt.global.roots'       ).requires('myt.global','myt.Observable');
    
    // Component
    var MYT_COMPONENT_ROOT = MYT_ROOT + 'component/';
    
    // Component : Base
    file(MYT_COMPONENT_ROOT + 'base/Text.js'  ).provides('myt.Text'  ).requires('myt.TextSupport','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'base/Markup.js').provides('myt.Markup').requires('myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'base/Canvas.js').provides('myt.Canvas').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'base/Image.js' ).provides('myt.Image' ).requires('myt.ImageSupport');
    
    // Component : Behavior
    file(MYT_COMPONENT_ROOT + 'behavior/Activateable.js'    ).provides('myt.Activateable'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'behavior/UpdateableUI.js'    ).provides('myt.UpdateableUI'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'behavior/Disableable.js'     ).provides('myt.Disableable'     ).requires('myt.UpdateableUI');
    file(MYT_COMPONENT_ROOT + 'behavior/KeyActivation.js'   ).provides('myt.KeyActivation'   ).requires('myt.Activateable','myt.Disableable','myt.KeyObservable','myt.FocusObservable');
    file(MYT_COMPONENT_ROOT + 'behavior/Draggable.js'       ).provides('myt.Draggable'       ).requires('myt.global.mouse','myt.global.dragManager','myt.Geometry');
    file(MYT_COMPONENT_ROOT + 'behavior/MouseOver.js'       ).provides('myt.MouseOver'       ).requires('myt.Disableable','myt.global.mouse','myt.MouseObservable');
    file(MYT_COMPONENT_ROOT + 'behavior/MouseDown.js'       ).provides('myt.MouseDown'       ).requires('myt.MouseOver');
    file(MYT_COMPONENT_ROOT + 'behavior/MouseOverAndDown.js').provides('myt.MouseOverAndDown').requires('myt.MouseDown');
    
    // Component : Sizing
    file(MYT_COMPONENT_ROOT + 'sizing/SizeWidthToDom.js'    ).provides('myt.SizeWidthToDom'    ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeHeightToDom.js'   ).provides('myt.SizeHeightToDom'   ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeToParent.js'      ).provides('myt.SizeToParent'      ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeToChildren.js'    ).provides('myt.SizeToChildren'    ).requires('myt.Layout');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeToWindow.js'      ).provides('myt.SizeToWindow'      ).requires('myt.RootView','myt.global.windowResize');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeToWindowWidth.js' ).provides('myt.SizeToWindowWidth' ).requires('myt.SizeToWindow');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeToWindowHeight.js').provides('myt.SizeToWindowHeight').requires('myt.SizeToWindow');
    
    // Component : Layout
    file(MYT_COMPONENT_ROOT + 'layout/SpacedLayout.js'  ).provides('myt.SpacedLayout'  ).requires('myt.VariableLayout');
    file(MYT_COMPONENT_ROOT + 'layout/ResizeLayout.js'  ).provides('myt.ResizeLayout'  ).requires('myt.SpacedLayout');
    file(MYT_COMPONENT_ROOT + 'layout/WrappingLayout.js').provides('myt.WrappingLayout').requires('myt.VariableLayout');
    file(MYT_COMPONENT_ROOT + 'layout/AlignedLayout.js' ).provides('myt.AlignedLayout' ).requires('myt.VariableLayout');
    
    // Component : Utilities
    file(MYT_COMPONENT_ROOT + 'util/Callback.js'    ).provides('myt.Callback'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'util/StateMachine.js').provides('myt.StateMachine').requires('myt.Node');
    
    // Component : Drawing
    file(MYT_COMPONENT_ROOT + 'drawing/Color.js'      ).provides('myt.Color'      ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'drawing/Path.js'       ).provides('myt.Path'       ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'drawing/DrawingUtil.js').provides('myt.DrawingUtil').requires('myt.Color','myt.Path');
    
    // Component : IO
    file(MYT_COMPONENT_ROOT + 'io/Ajax.js'  ).provides('myt.Ajax').requires('myt.Node');
    
    // Component : Timer
    file(MYT_COMPONENT_ROOT + 'timer/Timer.js'          ).provides('myt.Timer'          ).requires('myt.Callback');
    file(MYT_COMPONENT_ROOT + 'timer/RepeatableTimer.js').provides('myt.RepeatableTimer').requires('myt.Timer');
    
    // Component : Tooltip
    file(MYT_COMPONENT_ROOT + 'tooltip/BaseTooltip.js' ).provides('myt.BaseTooltip' ).requires('myt.RootView');
    file(MYT_COMPONENT_ROOT + 'tooltip/Tooltip.js'     ).provides('myt.Tooltip'     ).requires('myt.Canvas','myt.BaseTooltip');
    file(MYT_COMPONENT_ROOT + 'tooltip/TooltipMixin.js').provides('myt.TooltipMixin').requires('myt.global','myt.Tooltip');
    
    // Component : Button
    file(MYT_COMPONENT_ROOT + 'button/Button.js'               ).provides('myt.Button'               ).requires('myt.UpdateableUI','myt.MouseOverAndDown','myt.KeyActivation','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'button/SimpleButton.js'         ).provides('myt.SimpleButton'         ).requires('myt.View','myt.Button');
    file(MYT_COMPONENT_ROOT + 'button/IconTextButtonContent.js').provides('myt.IconTextButtonContent').requires('myt.Image','myt.Text');
    file(MYT_COMPONENT_ROOT + 'button/TextButtonContent.js'    ).provides('myt.TextButtonContent'    ).requires('myt.Text');
    file(MYT_COMPONENT_ROOT + 'button/SimpleIconTextButton.js' ).provides('myt.SimpleIconTextButton' ).requires('myt.SimpleButton','myt.IconTextButtonContent','myt.TooltipMixin');
    
    // Component : Panel
    file(MYT_COMPONENT_ROOT + 'panel/ThreePanel.js'          ).provides('myt.ThreePanel'          ).requires('myt.View','myt.Image','myt.ResizeLayout','myt.SizeToChildren');
    file(MYT_COMPONENT_ROOT + 'panel/HorizontalThreePanel.js').provides('myt.HorizontalThreePanel').requires('myt.View','myt.Image','myt.ResizeLayout');
    file(MYT_COMPONENT_ROOT + 'panel/VerticalThreePanel.js'  ).provides('myt.VerticalThreePanel'  ).requires('myt.View','myt.Image','myt.ResizeLayout');
    file(MYT_COMPONENT_ROOT + 'panel/BaseMouseablePanel.js'  ).provides('myt.BaseMouseablePanel'  ).requires('myt.Button');
    file(MYT_COMPONENT_ROOT + 'panel/MouseableH3Panel.js'    ).provides('myt.MouseableH3Panel'    ).requires('myt.BaseMouseablePanel','myt.HorizontalThreePanel');
    file(MYT_COMPONENT_ROOT + 'panel/MouseableV3Panel.js'    ).provides('myt.MouseableV3Panel'    ).requires('myt.BaseMouseablePanel','myt.VerticalThreePanel');
    
    // Component : Panel Button
    file(MYT_COMPONENT_ROOT + 'panelbutton/PanelButton.js'        ).provides('myt.PanelButton'        ).requires('myt.MouseableH3Panel');
    file(MYT_COMPONENT_ROOT + 'panelbutton/IconTextPanelButton.js').provides('myt.IconTextPanelButton').requires('myt.PanelButton','myt.TooltipMixin','myt.IconTextButtonContent');
    
    // Component : Drawing Method
    file(MYT_COMPONENT_ROOT + 'drawingmethod/DrawingMethod.js').provides('myt.DrawingMethod').requires('myt','myt.DrawingUtil');

    // Component : Draw Button
    file(MYT_COMPONENT_ROOT + 'drawbutton/DrawButton.js').provides('myt.DrawButton').requires('myt.Canvas','myt.Button','myt.DrawingMethod');
    
    // Component : Model
    file(MYT_COMPONENT_ROOT + 'model/BAGMembership.js'    ).provides('myt.BAGMembership'    ).requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'model/BAG.js'              ).provides('myt.BAG'              ).requires('myt.BAGMembership');
    file(MYT_COMPONENT_ROOT + 'model/DelayedMethodCall.js').provides('myt.DelayedMethodCall').requires('myt.AccessorSupport','myt.Timer');
    
    // Component : Floating Panel
    file(MYT_COMPONENT_ROOT + 'floatingpanel/FloatingPanel.js'      ).provides('myt.FloatingPanel'      ).requires('myt.RootView');
    file(MYT_COMPONENT_ROOT + 'floatingpanel/FloatingPanelAnchor.js').provides('myt.FloatingPanelAnchor').requires('myt.FloatingPanel');
    
    // Component : Checkbox
    file(MYT_COMPONENT_ROOT + 'checkbox/CheckboxDrawingMethod.js').provides('myt.CheckboxDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'checkbox/CheckboxMixin.js'        ).provides('myt.CheckboxMixin'        ).requires('myt.CheckboxDrawingMethod');
    file(MYT_COMPONENT_ROOT + 'checkbox/Checkbox.js'             ).provides('myt.Checkbox'             ).requires('myt.DrawButton','myt.CheckboxMixin');
    file(MYT_COMPONENT_ROOT + 'checkbox/TextCheckbox.js'         ).provides('myt.TextCheckbox'         ).requires('myt.Checkbox','myt.TextButtonContent','myt.TooltipMixin');
    
    // Component : Radio
    file(MYT_COMPONENT_ROOT + 'radio/RadioDrawingMethod.js').provides('myt.RadioDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'radio/RadioMixin.js'        ).provides('myt.RadioMixin'        ).requires('myt.CheckboxMixin','myt.RadioDrawingMethod','myt.BAG');
    file(MYT_COMPONENT_ROOT + 'radio/Radio.js'             ).provides('myt.Radio'             ).requires('myt.DrawButton','myt.RadioMixin');
    file(MYT_COMPONENT_ROOT + 'radio/TextRadio.js'         ).provides('myt.TextRadio'         ).requires('myt.Radio','myt.TextButtonContent','myt.TooltipMixin');
    
    // Component : Tab Slider
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSliderContainer.js'    ).provides('myt.TabSliderContainer'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSliderDrawingMethod.js').provides('myt.TabSliderDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSlider.js'             ).provides('myt.TabSlider'             ).requires('myt.Radio','myt.TabSliderDrawingMethod','myt.TabSliderContainer');
    file(MYT_COMPONENT_ROOT + 'tabslider/TextTabSlider.js'         ).provides('myt.TextTabSlider'         ).requires('myt.TabSlider');
    
    // Component : Tab
    file(MYT_COMPONENT_ROOT + 'tab/TabContainer.js'    ).provides('myt.TabContainer'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'tab/TabDrawingMethod.js').provides('myt.TabDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'tab/Tab.js'             ).provides('myt.Tab'             ).requires('myt.DrawButton','myt.IconTextButtonContent','myt.RadioMixin','myt.TabDrawingMethod','myt.TabContainer');
    
    // Component : Input
    file(MYT_COMPONENT_ROOT + 'input/InputObservable.js'   ).provides('myt.InputObservable'   ).requires('myt.DomObservable');
    file(MYT_COMPONENT_ROOT + 'input/NativeInputWrapper.js').provides('myt.NativeInputWrapper').requires('myt.View','myt.InputObservable','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'input/BaseInputText.js'     ).provides('myt.BaseInputText'     ).requires('myt.NativeInputWrapper','myt.TextSupport');
    file(MYT_COMPONENT_ROOT + 'input/InputText.js'         ).provides('myt.InputText'         ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/InputTextArea.js'     ).provides('myt.InputTextArea'     ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/InputCheckbox.js'     ).provides('myt.InputCheckbox'     ).requires('myt.NativeInputWrapper','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'input/InputRadio.js'        ).provides('myt.InputRadio'        ).requires('myt.NativeInputWrapper','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'input/InputSelect.js'       ).provides('myt.InputSelect'       ).requires('myt.NativeInputWrapper','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'input/InputSelectOption.js' ).provides('myt.InputSelectOption' ).requires('myt.InputSelect');
    
    // Component : Uploader
    file(MYT_COMPONENT_ROOT + 'uploader/Uploader.js'     ).provides('myt.Uploader'     ).requires('myt.View','myt.NativeInputWrapper','myt.Disableable','myt.Ajax');
    file(MYT_COMPONENT_ROOT + 'uploader/ImageUploader.js').provides('myt.ImageUploader').requires('myt.Uploader');
    
    // Component : Dimmer
    file(MYT_COMPONENT_ROOT + 'dimmer/Dimmer.js'    ).provides('myt.Dimmer'    ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'dimmer/ModalPanel.js').provides('myt.ModalPanel').requires('myt.Dimmer','myt.SizeToChildren');
    
    // Component : Spinner
    file(MYT_COMPONENT_ROOT + 'spinner/Spinner.js').provides('myt.Spinner').requires('myt.View');
    
    // Component : Dialog
    file(MYT_COMPONENT_ROOT + 'dialog/Dialog.js').provides('myt.Dialog').requires('myt.ModalPanel','myt.DrawButton','myt.Spinner');
    
    // Include Everything
    file(MYT_ROOT + 'all.js').provides('myt.all').requires(
        'myt.Cookie',
        'myt.global.keys',
        'myt.Text', 'myt.Markup', 'myt.SizeWidthToDom', 'myt.SizeHeightToDom', 'myt.SizeToParent',
        'myt.SizeToWindowWidth', 'myt.SizeToWindowHeight', 'myt.TransformSupport', 
        'myt.Animator', 'myt.Callback', 'myt.RepeatableTimer', 'myt.StateMachine', 'myt.URI', 'myt.Ajax', 
        'myt.Draggable', 'myt.WrappingLayout', 'myt.ResizeLayout', 'myt.AlignedLayout', 'myt.ThreePanel',
        'myt.DrawButton', 'myt.SimpleIconTextButton', 'myt.IconTextPanelButton', 'myt.DelayedMethodCall',
        'myt.FloatingPanelAnchor',
        'myt.TextCheckbox','myt.TextRadio','myt.TextTabSlider', 'myt.Tab',
        'myt.InputText', 'myt.InputTextArea', 'myt.InputCheckbox', 'myt.InputRadio', 'myt.InputSelectOption',
        'myt.ImageUploader','myt.Dialog'
    );
}});
