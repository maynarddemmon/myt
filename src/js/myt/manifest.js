JS.Packages(function() {with(this) {
    // Package:myt
    var MYT_ROOT = global.MYT_ROOT || '../js/myt/';
    
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
    file(MYT_CORE_ROOT + 'Node.js'           ).provides('myt.Node'           ).requires('myt.AccessorSupport','myt.Destructible','myt.Constrainable');
    file(MYT_CORE_ROOT + 'Animator.js'       ).provides('myt.Animator'       ).requires('myt.Node','myt.global.idle');
    
    // Core : Events
    var MYT_EVENTS_ROOT = MYT_CORE_ROOT + 'events/';
    file(MYT_EVENTS_ROOT + 'Observable.js'   ).provides('myt.Observable'   ).requires('myt');
    file(MYT_EVENTS_ROOT + 'Observer.js'     ).provides('myt.Observer'     ).requires('myt.Observable');
    file(MYT_EVENTS_ROOT + 'Constrainable.js').provides('myt.Constrainable').requires('myt.Observer');
    
    // Core : Model
    var MYT_MODEL_ROOT = MYT_CORE_ROOT + 'model/';
    file(MYT_MODEL_ROOT + 'ThresholdCounter.js').provides('myt.ThresholdCounter').requires('myt.Destructible','myt.Observable');
    
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
    file(MYT_COMPONENT_ROOT + 'behavior/ActivateByKey.js').provides('myt.ActivateByKey').requires('myt.KeyObservable','myt.FocusObservable');
    file(MYT_COMPONENT_ROOT + 'behavior/Disableable.js'  ).provides('myt.Disableable'  ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'behavior/Draggable.js'    ).provides('myt.Draggable'    ).requires('myt.global.mouse','myt.global.dragManager');
    file(MYT_COMPONENT_ROOT + 'behavior/OverDown.js'     ).provides('myt.OverDown'     ).requires('myt.Disableable','myt.global.mouse','myt.MouseObservable');
    
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
    
    // Component : Model
    file(MYT_COMPONENT_ROOT + 'model/BooleanAttributeGroupMembership.js').provides('myt.BooleanAttributeGroupMembership').requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'model/BooleanAttributeGroup.js'          ).provides('myt.BooleanAttributeGroup'          ).requires('myt.BooleanAttributeGroupMembership');
    
    // Component : IO
    file(MYT_COMPONENT_ROOT + 'io/Ajax.js'  ).provides('myt.Ajax').requires('myt.Node');
    
    file(MYT_COMPONENT_ROOT + 'timer/Timer.js'          ).provides('myt.Timer'          ).requires('myt.Callback');
    file(MYT_COMPONENT_ROOT + 'timer/RepeatableTimer.js').provides('myt.RepeatableTimer').requires('myt.Timer');
    
    file(MYT_COMPONENT_ROOT + 'button/ButtonMixin.js').provides('myt.ButtonMixin').requires('myt.OverDown','myt.ActivateByKey','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'button/Button.js'     ).provides('myt.Button'     ).requires('myt.View','myt.ButtonMixin');
    
    file(MYT_COMPONENT_ROOT + 'panel/ThreePanel.js'          ).provides('myt.ThreePanel'          ).requires('myt.View','myt.Image','myt.ResizeLayout','myt.SizeToChildren');
    file(MYT_COMPONENT_ROOT + 'panel/HorizontalThreePanel.js').provides('myt.HorizontalThreePanel').requires('myt.View','myt.Image','myt.ResizeLayout');
    file(MYT_COMPONENT_ROOT + 'panel/VerticalThreePanel.js'  ).provides('myt.VerticalThreePanel'  ).requires('myt.View','myt.Image','myt.ResizeLayout');
    file(MYT_COMPONENT_ROOT + 'panel/BaseMouseablePanel.js'  ).provides('myt.BaseMouseablePanel'  ).requires('myt.Disableable','myt.OverDown','myt.ActivateByKey');
    file(MYT_COMPONENT_ROOT + 'panel/MouseableH3Panel.js'    ).provides('myt.MouseableH3Panel'    ).requires('myt.BaseMouseablePanel','myt.HorizontalThreePanel');
    file(MYT_COMPONENT_ROOT + 'panel/MouseableV3Panel.js'    ).provides('myt.MouseableV3Panel'    ).requires('myt.BaseMouseablePanel','myt.VerticalThreePanel');
    
    file(MYT_COMPONENT_ROOT + 'imagebutton/BaseImageButton.js').provides('myt.BaseImageButton').requires('myt.MouseableH3Panel');
    file(MYT_COMPONENT_ROOT + 'imagebutton/ImageButton.js'    ).provides('myt.ImageButton'    ).requires('myt.BaseImageButton','myt.TooltipMixin');
    
    file(MYT_COMPONENT_ROOT + 'tooltip/BaseTooltip.js' ).provides('myt.BaseTooltip' ).requires('myt.RootView');
    file(MYT_COMPONENT_ROOT + 'tooltip/Tooltip.js'     ).provides('myt.Tooltip'     ).requires('myt.Canvas','myt.BaseTooltip');
    file(MYT_COMPONENT_ROOT + 'tooltip/TooltipMixin.js').provides('myt.TooltipMixin').requires('myt.global','myt.Tooltip');
    
    file(MYT_COMPONENT_ROOT + 'drawingroutine/DrawingRoutine.js').provides('myt.DrawingRoutine').requires('myt');
    
    file(MYT_COMPONENT_ROOT + 'listview/AbstractListViewItem.js'      ).provides('myt.AbstractListViewItem'      ).requires('myt.Disableable','myt.OverDown','myt.View');
    file(MYT_COMPONENT_ROOT + 'listview/AbstractListView.js'          ).provides('myt.AbstractListView'          ).requires('myt.AbstractListViewItem');
    file(MYT_COMPONENT_ROOT + 'listview/SelectableAbstractListView.js').provides('myt.SelectableAbstractListView').requires('myt.AbstractListView');
    file(MYT_COMPONENT_ROOT + 'listview/ListViewDisplayMixin.js'      ).provides('myt.ListViewDisplayMixin'      ).requires('myt.Canvas','myt.SizeToChildren','myt.SpacedLayout');
    file(MYT_COMPONENT_ROOT + 'listview/simple/SimpleListViewItem.js' ).provides('myt.SimpleListViewItem'        ).requires('myt.AbstractListViewItem','myt.SizeToChildren');
    file(MYT_COMPONENT_ROOT + 'listview/simple/SimpleListView.js'     ).provides('myt.SimpleListView'            ).requires('myt.ListViewDisplayMixin','myt.SelectableAbstractListView','myt.SimpleListViewItem');
    
    file(MYT_COMPONENT_ROOT + 'form/InputObservable.js'  ).provides('myt.InputObservable'  ).requires('myt.DomObservable');
    file(MYT_COMPONENT_ROOT + 'form/Input.js'            ).provides('myt.Input'            ).requires('myt.View','myt.InputObservable','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'form/BaseInputText.js'    ).provides('myt.BaseInputText'    ).requires('myt.Input','myt.TextSupport');
    file(MYT_COMPONENT_ROOT + 'form/InputText.js'        ).provides('myt.InputText'        ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'form/InputTextArea.js'    ).provides('myt.InputTextArea'    ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'form/InputCheckbox.js'    ).provides('myt.InputCheckbox'    ).requires('myt.Input','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'form/InputRadio.js'       ).provides('myt.InputRadio'       ).requires('myt.Input','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'form/InputSelect.js'      ).provides('myt.InputSelect'      ).requires('myt.Input','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'form/InputSelectOption.js').provides('myt.InputSelectOption').requires('myt.InputSelect');
    
    // TODO: remove
    file(MYT_COMPONENT_ROOT + 'Window.js').provides('myt.Window').requires('myt.ImageSupport','myt.Draggable');
    
    // Include Everything
    file(MYT_ROOT + 'all.js').provides('myt.all').requires(
        'myt.global.keys',
        'myt.Text', 'myt.Markup', 'myt.SizeWidthToDom', 'myt.SizeHeightToDom',
        'myt.Animator', 'myt.Callback', 'myt.RepeatableTimer', 
        'myt.SimpleListView', 'myt.Tooltip', 'myt.Cookie', 'myt.ImageButton',
        'myt.Draggable', 'myt.Button', 'myt.Window', 'myt.WrappingLayout',
        'myt.SizeToWindowWidth', 'myt.SizeToWindowHeight',
        'myt.TransformSupport', 'myt.InputRadio', 'myt.InputSelectOption', 'myt.InputText', 'myt.InputTextArea', 'myt.InputCheckbox',
        'myt.BooleanAttributeGroup', 'myt.StateMachine', 'myt.URI', 'myt.Ajax'
    );
}});
