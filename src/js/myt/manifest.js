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
    file(MYT_SHIM_ROOT + 'history.js'      ).provides('History','History.Adapter').requires('JSON');
    file(MYT_SHIM_ROOT + 'language.js'     ).provides('Object.keys','Array.isArray','Date.now');
    
    // Util
    var UTIL_ROOT = MYT_ROOT + 'util/';
    file(UTIL_ROOT + 'Cookie.js'  ).provides('myt.Cookie'  ).requires('myt');
    file(UTIL_ROOT + 'URI.js'     ).provides('myt.URI'     ).requires('myt');
    file(UTIL_ROOT + 'XML.js'     ).provides('myt.XML'     ).requires('myt');
    file(UTIL_ROOT + 'Geometry.js').provides('myt.Geometry').requires('myt');
    
    // Core
    var MYT_CORE_ROOT = MYT_ROOT + 'core/';
    file(MYT_CORE_ROOT + 'myt.js'            ).provides('myt'                ).requires('BrowserDetect','console','JSON','History','History.Adapter',
                                                                                        'Object.keys','Array.isArray','Date.now',
                                                                                        'JS.Class','JS.Module','JS.Singleton');
    file(MYT_CORE_ROOT + 'Destructible.js'   ).provides('myt.Destructible'   ).requires('myt');
    file(MYT_CORE_ROOT + 'AccessorSupport.js').provides('myt.AccessorSupport').requires('myt');
    file(MYT_CORE_ROOT + 'Eventable.js'      ).provides('myt.Eventable'      ).requires('myt.AccessorSupport','myt.Destructible',
                                                                                        'myt.Constrainable','myt.TrackActivesPool');
    file(MYT_CORE_ROOT + 'Node.js'           ).provides('myt.Node'           ).requires('myt.AccessorSupport','myt.Destructible',
                                                                                        'myt.Constrainable','myt.TrackActivesPool');
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
    file(MYT_VIEW_ROOT + 'View.js'           ).provides('myt.View'           ).requires('myt.Layout','myt.MouseObservable','myt.KeyObservable',
                                                                                        'myt.DomObserver','myt.FocusObservable',
                                                                                        'myt.ScrollObservable','myt.Geometry');
    file(MYT_VIEW_ROOT + 'RootView.js'       ).provides('myt.RootView'       ).requires('myt.View','myt.global.roots');
    
    file(MYT_VIEW_ROOT + 'ImageSupport.js'    ).provides('myt.ImageSupport'    ).requires('myt.View');
    file(MYT_VIEW_ROOT + 'TransformSupport.js').provides('myt.TransformSupport').requires('myt.View');
    file(MYT_VIEW_ROOT + 'SizeToDom.js'       ).provides('myt.SizeToDom'       ).requires('myt.TransformSupport');
    file(MYT_VIEW_ROOT + 'TextSupport.js'     ).provides('myt.TextSupport'     ).requires('myt.SizeToDom');
    
    // Core : Dom Events
    var MYT_DOM_EVENTS_ROOT = MYT_CORE_ROOT + 'dom_events/';
    file(MYT_DOM_EVENTS_ROOT + 'DomObservable.js'   ).provides('myt.DomObservable'   ).requires('myt.DomElementProxy');
    file(MYT_DOM_EVENTS_ROOT + 'DomObserver.js'     ).provides('myt.DomObserver'     ).requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'MouseObservable.js' ).provides('myt.MouseObservable' ).requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'KeyObservable.js'   ).provides('myt.KeyObservable'   ).requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'FocusObservable.js' ).provides('myt.FocusObservable' ).requires('myt.DomObservable','myt.global.focus');
    file(MYT_DOM_EVENTS_ROOT + 'ScrollObservable.js').provides('myt.ScrollObservable').requires('myt.DomObservable');
    file(MYT_DOM_EVENTS_ROOT + 'TouchObservable.js' ).provides('myt.TouchObservable' ).requires('myt.DomObservable');
    
    // Core : Layout
    var MYT_LAYOUT_ROOT = MYT_CORE_ROOT + 'layout/';
    file(MYT_LAYOUT_ROOT + 'Layout.js'        ).provides('myt.Layout'        ).requires('myt.Node','myt.ThresholdCounter');
    file(MYT_LAYOUT_ROOT + 'ConstantLayout.js').provides('myt.ConstantLayout').requires('myt.Layout');
    file(MYT_LAYOUT_ROOT + 'VariableLayout.js').provides('myt.VariableLayout').requires('myt.ConstantLayout');
    
    // Core : Globals
    var MYT_GLOBALS_ROOT = MYT_CORE_ROOT + 'globals/';
    file(MYT_GLOBALS_ROOT + 'Global.js'                ).provides('myt.global'             ).requires('myt.Constrainable');
    file(MYT_GLOBALS_ROOT + 'GlobalHistory.js'         ).provides('myt.global.history'     ).requires('myt.global','myt.Observable','History','History.Adapter');
    file(MYT_GLOBALS_ROOT + 'GlobalIdle.js'            ).provides('myt.global.idle'        ).requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalMouse.js'           ).provides('myt.global.mouse'       ).requires('myt.global','myt.DomObservable','myt.MouseObservable');
    file(MYT_GLOBALS_ROOT + 'GlobalTouch.js'           ).provides('myt.global.touch'       ).requires('myt.global','myt.DomObservable','myt.TouchObservable');
    file(MYT_GLOBALS_ROOT + 'GlobalFocus.js'           ).provides('myt.global.focus'       ).requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalKeys.js'            ).provides('myt.global.keys'        ).requires('myt.global','myt.DomObserver','myt.KeyObservable',
                                                                                                      'myt.global.focus','myt.Observer');
    file(MYT_GLOBALS_ROOT + 'GlobalDragManager.js'     ).provides('myt.global.dragManager' ).requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalWindowResize.js'    ).provides('myt.global.windowResize').requires('myt.global','myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalRootViewRegistry.js').provides('myt.global.roots'       ).requires('myt.global','myt.Observable');
    
    // Component
    var MYT_COMPONENT_ROOT = MYT_ROOT + 'component/';
    
    // Component : Base
    file(MYT_COMPONENT_ROOT + 'base/Text.js'  ).provides('myt.Text'  ).requires('myt.TextSupport');
    file(MYT_COMPONENT_ROOT + 'base/Markup.js').provides('myt.Markup').requires('myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'base/Canvas.js').provides('myt.Canvas').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'base/Image.js' ).provides('myt.Image' ).requires('myt.ImageSupport');
    
    // Component : Behavior
    file(MYT_COMPONENT_ROOT + 'behavior/Activateable.js'    ).provides('myt.Activateable'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'behavior/UpdateableUI.js'    ).provides('myt.UpdateableUI'    ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'behavior/Disableable.js'     ).provides('myt.Disableable'     ).requires('myt.UpdateableUI');
    file(MYT_COMPONENT_ROOT + 'behavior/KeyActivation.js'   ).provides('myt.KeyActivation'   ).requires('myt.Activateable','myt.Disableable',
                                                                                                        'myt.KeyObservable','myt.FocusObservable');
    file(MYT_COMPONENT_ROOT + 'behavior/Draggable.js'       ).provides('myt.Draggable'       ).requires('myt.global.mouse','myt.global.dragManager','myt.Geometry');
    file(MYT_COMPONENT_ROOT + 'behavior/MouseOver.js'       ).provides('myt.MouseOver'       ).requires('myt.Disableable','myt.global.mouse','myt.MouseObservable');
    file(MYT_COMPONENT_ROOT + 'behavior/MouseDown.js'       ).provides('myt.MouseDown'       ).requires('myt.MouseOver');
    file(MYT_COMPONENT_ROOT + 'behavior/MouseOverAndDown.js').provides('myt.MouseOverAndDown').requires('myt.MouseDown');
    
    // Component : Sizing
    file(MYT_COMPONENT_ROOT + 'sizing/SizeWidthToDom.js'    ).provides('myt.SizeWidthToDom'    ).requires('myt.TransformSupport');
    file(MYT_COMPONENT_ROOT + 'sizing/SizeHeightToDom.js'   ).provides('myt.SizeHeightToDom'   ).requires('myt.TransformSupport');
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
    
    // Component : Drag and Drop
    file(MYT_COMPONENT_ROOT + 'dragdrop/DragGroupSupport.js').provides('myt.DragGroupSupport').requires('myt.View','myt.global.mouse');
    file(MYT_COMPONENT_ROOT + 'dragdrop/Dropable.js'        ).provides('myt.Dropable'        ).requires('myt.Draggable','myt.DragGroupSupport');
    file(MYT_COMPONENT_ROOT + 'dragdrop/DropTarget.js'      ).provides('myt.DropTarget'      ).requires('myt.Dropable','myt.DragGroupSupport');
    file(MYT_COMPONENT_ROOT + 'dragdrop/DropSource.js'      ).provides('myt.DropSource'      ).requires('myt.Dropable');
    file(MYT_COMPONENT_ROOT + 'dragdrop/AutoScroller.js'    ).provides('myt.AutoScroller'    ).requires('myt.DragGroupSupport');
    
    // Component : Drawing
    file(MYT_COMPONENT_ROOT + 'drawing/Color.js'      ).provides('myt.Color'      ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'drawing/Path.js'       ).provides('myt.Path'       ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'drawing/DrawingUtil.js').provides('myt.DrawingUtil').requires('myt.Color','myt.Path');
    
    // Component : IO
    file(MYT_COMPONENT_ROOT + 'io/Ajax.js'  ).provides('myt.Ajax').requires('myt.Node');
    
    // Component : Timer
    file(MYT_COMPONENT_ROOT + 'timer/Timer.js'          ).provides('myt.Timer'          ).requires('myt.Callback');
    file(MYT_COMPONENT_ROOT + 'timer/RepeatableTimer.js').provides('myt.RepeatableTimer').requires('myt.Timer');
    
    // Component : Replicator
    file(MYT_COMPONENT_ROOT + 'replicator/Replicable.js').provides('myt.Replicable').requires('myt.Reusable');
    file(MYT_COMPONENT_ROOT + 'replicator/Replicator.js').provides('myt.Replicator').requires('myt.Replicable','myt.Node','myt.TrackActivesPool');
    
    // Component : Selection
    file(MYT_COMPONENT_ROOT + 'selection/Selectable.js'      ).provides('myt.Selectable'      ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'selection/SelectionManager.js').provides('myt.SelectionManager').requires('myt.Selectable','myt.global.keys');
    
    // Component : Tooltip
    file(MYT_COMPONENT_ROOT + 'tooltip/BaseTooltip.js' ).provides('myt.BaseTooltip' ).requires('myt.RootView');
    file(MYT_COMPONENT_ROOT + 'tooltip/Tooltip.js'     ).provides('myt.Tooltip'     ).requires('myt.Canvas','myt.BaseTooltip');
    file(MYT_COMPONENT_ROOT + 'tooltip/TooltipMixin.js').provides('myt.TooltipMixin').requires('myt.global','myt.Tooltip');
    
    // Component : Button
    file(MYT_COMPONENT_ROOT + 'button/Button.js'               ).provides('myt.Button'               ).requires('myt.UpdateableUI','myt.MouseOverAndDown',
                                                                                                                'myt.KeyActivation','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'button/SimpleButton.js'         ).provides('myt.SimpleButton'         ).requires('myt.View','myt.Button');
    file(MYT_COMPONENT_ROOT + 'button/IconTextButtonContent.js').provides('myt.IconTextButtonContent').requires('myt.Image','myt.Text');
    file(MYT_COMPONENT_ROOT + 'button/TextButtonContent.js'    ).provides('myt.TextButtonContent'    ).requires('myt.Text');
    file(MYT_COMPONENT_ROOT + 'button/SimpleIconTextButton.js' ).provides('myt.SimpleIconTextButton' ).requires('myt.SimpleButton','myt.IconTextButtonContent',
                                                                                                                'myt.TooltipMixin');
    
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
    file(MYT_COMPONENT_ROOT + 'model/BAGMembership.js'        ).provides('myt.BAGMembership'        ).requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'model/BAG.js'                  ).provides('myt.BAG'                  ).requires('myt.BAGMembership');
    file(MYT_COMPONENT_ROOT + 'model/DelayedMethodCall.js'    ).provides('myt.DelayedMethodCall'    ).requires('myt.AccessorSupport','myt.Timer');
    file(MYT_COMPONENT_ROOT + 'model/ValueComponent.js'       ).provides('myt.ValueComponent'       ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'model/BoundedValueComponent.js').provides('myt.BoundedValueComponent').requires('myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'model/RangeComponent.js'       ).provides('myt.RangeComponent'       ).requires('myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'model/BoundedRangeComponent.js').provides('myt.BoundedRangeComponent').requires('myt.RangeComponent','myt.BoundedValueComponent');
    
    // Component : Divider
    file(MYT_COMPONENT_ROOT + 'divider/DividerDrawingMethod.js').provides('myt.DividerDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'divider/BaseDivider.js'         ).provides('myt.BaseDivider'         ).requires('myt.DrawButton','myt.DividerDrawingMethod',
                                                                                                               'myt.BoundedValueComponent','myt.Draggable');
    file(MYT_COMPONENT_ROOT + 'divider/HorizontalDivider.js'   ).provides('myt.HorizontalDivider'   ).requires('myt.BaseDivider');
    file(MYT_COMPONENT_ROOT + 'divider/VerticalDivider.js'     ).provides('myt.VerticalDivider'     ).requires('myt.BaseDivider');
    
    // Component : Grid
    file(MYT_COMPONENT_ROOT + 'grid/GridColumnHeader.js').provides('myt.GridColumnHeader').requires('myt.View','myt.BoundedValueComponent');
    file(MYT_COMPONENT_ROOT + 'grid/GridRow.js'         ).provides('myt.GridRow'         ).requires('myt.GridColumnHeader');
    file(MYT_COMPONENT_ROOT + 'grid/GridController.js'  ).provides('myt.GridController'  ).requires('myt.GridRow');
    file(MYT_COMPONENT_ROOT + 'grid/Grid.js'            ).provides('myt.Grid'            ).requires('myt.GridController');
    
    file(MYT_COMPONENT_ROOT + 'grid/SimpleGridColumnHeader.js').provides('myt.SimpleGridColumnHeader').requires(
        'myt.GridColumnHeader','myt.SimpleIconTextButton'
    );
    
    // Component : Floating Panel
    file(MYT_COMPONENT_ROOT + 'floatingpanel/FloatingPanel.js'      ).provides('myt.FloatingPanel'      ).requires('myt.RootView');
    file(MYT_COMPONENT_ROOT + 'floatingpanel/FloatingPanelAnchor.js').provides('myt.FloatingPanelAnchor').requires('myt.FloatingPanel');
    
    // Component : List View
    file(MYT_COMPONENT_ROOT + 'listview/ListViewItemMixin.js').provides('myt.ListViewItemMixin').requires('myt');
    file(MYT_COMPONENT_ROOT + 'listview/ListViewSeparator.js').provides('myt.ListViewSeparator').requires('myt.View','myt.ListViewItemMixin');
    file(MYT_COMPONENT_ROOT + 'listview/ListViewItem.js'     ).provides('myt.ListViewItem'     ).requires('myt.SimpleIconTextButton','myt.ListViewItemMixin');
    file(MYT_COMPONENT_ROOT + 'listview/ListView.js'         ).provides('myt.ListView'         ).requires('myt.FloatingPanel','myt.ListViewItem','myt.ListViewSeparator');
    file(MYT_COMPONENT_ROOT + 'listview/ListViewAnchor.js'   ).provides('myt.ListViewAnchor'   ).requires('myt.ListView','myt.FloatingPanelAnchor');
    
    // Component : Checkbox
    file(MYT_COMPONENT_ROOT + 'checkbox/CheckboxDrawingMethod.js').provides('myt.CheckboxDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'checkbox/CheckboxStyleMixin.js'   ).provides('myt.CheckboxStyleMixin'   ).requires('myt.DrawButton');
    file(MYT_COMPONENT_ROOT + 'checkbox/CheckboxMixin.js'        ).provides('myt.CheckboxMixin'        ).requires('myt.CheckboxStyleMixin','myt.ValueComponent','myt.CheckboxDrawingMethod');
    file(MYT_COMPONENT_ROOT + 'checkbox/Checkbox.js'             ).provides('myt.Checkbox'             ).requires('myt.CheckboxMixin');
    file(MYT_COMPONENT_ROOT + 'checkbox/TextCheckbox.js'         ).provides('myt.TextCheckbox'         ).requires('myt.Checkbox','myt.TextButtonContent','myt.TooltipMixin');
    
    // Component : Radio
    file(MYT_COMPONENT_ROOT + 'radio/RadioDrawingMethod.js').provides('myt.RadioDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'radio/RadioMixin.js'        ).provides('myt.RadioMixin'        ).requires('myt.CheckboxStyleMixin','myt.ValueComponent','myt.RadioDrawingMethod','myt.BAG');
    file(MYT_COMPONENT_ROOT + 'radio/Radio.js'             ).provides('myt.Radio'             ).requires('myt.DrawButton','myt.RadioMixin');
    file(MYT_COMPONENT_ROOT + 'radio/TextRadio.js'         ).provides('myt.TextRadio'         ).requires('myt.Radio','myt.TextButtonContent','myt.TooltipMixin');
    
    // Component : Slider
    file(MYT_COMPONENT_ROOT + 'slider/SliderThumbMixin.js'     ).provides('myt.SliderThumbMixin'     ).requires('myt.View','myt.Draggable');
    file(MYT_COMPONENT_ROOT + 'slider/SimpleSliderThumb.js'    ).provides('myt.SimpleSliderThumb'    ).requires('myt.SliderThumbMixin','myt.SimpleButton');
    file(MYT_COMPONENT_ROOT + 'slider/BaseSlider.js'           ).provides('myt.BaseSlider'           ).requires('myt.Disableable','myt.SimpleSliderThumb');
    file(MYT_COMPONENT_ROOT + 'slider/Slider.js'               ).provides('myt.Slider'               ).requires('myt.BoundedValueComponent','myt.BaseSlider');
    file(MYT_COMPONENT_ROOT + 'slider/SimpleSliderRangeFill.js').provides('myt.SimpleSliderRangeFill').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'slider/RangeSlider.js'          ).provides('myt.RangeSlider'          ).requires('myt.BoundedRangeComponent','myt.BaseSlider',
                                                                                                                'myt.SimpleSliderRangeFill');
    
    // Component : Tab Slider
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSliderContainer.js'    ).provides('myt.TabSliderContainer'    ).requires('myt.SelectionManager','myt.DelayedMethodCall');
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSliderDrawingMethod.js').provides('myt.TabSliderDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSlider.js'             ).provides('myt.TabSlider'             ).requires('myt.Radio','myt.TabSliderDrawingMethod','myt.TabSliderContainer');
    file(MYT_COMPONENT_ROOT + 'tabslider/TextTabSlider.js'         ).provides('myt.TextTabSlider'         ).requires('myt.TabSlider');
    
    // Component : Tab
    file(MYT_COMPONENT_ROOT + 'tab/TabContainer.js'    ).provides('myt.TabContainer'    ).requires('myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'tab/TabMixin.js'        ).provides('myt.TabMixin'        ).requires('myt.Selectable','myt.TabContainer');
    file(MYT_COMPONENT_ROOT + 'tab/TabDrawingMethod.js').provides('myt.TabDrawingMethod').requires('myt.DrawingMethod');
    file(MYT_COMPONENT_ROOT + 'tab/Tab.js'             ).provides('myt.Tab'             ).requires('myt.DrawButton','myt.IconTextButtonContent',
                                                                                                   'myt.TabDrawingMethod','myt.TabMixin');
    file(MYT_COMPONENT_ROOT + 'tab/SimpleTab.js'       ).provides('myt.SimpleTab'       ).requires('myt.SimpleIconTextButton','myt.TabMixin');
    
    // Component : Panel Stack
    file(MYT_COMPONENT_ROOT + 'panelstack/StackablePanel.js').provides('myt.StackablePanel').requires('myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'panelstack/PanelStack.js'    ).provides('myt.PanelStack'    ).requires('myt.StackablePanel','myt.View');
    
    // Component : Input
    file(MYT_COMPONENT_ROOT + 'input/InputObservable.js'   ).provides('myt.InputObservable'   ).requires('myt.DomObservable');
    file(MYT_COMPONENT_ROOT + 'input/NativeInputWrapper.js').provides('myt.NativeInputWrapper').requires('myt.View','myt.InputObservable','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'input/BaseInputText.js'     ).provides('myt.BaseInputText'     ).requires('myt.NativeInputWrapper','myt.TextSupport');
    file(MYT_COMPONENT_ROOT + 'input/InputText.js'         ).provides('myt.InputText'         ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/ComboBox.js'          ).provides('myt.ComboBox'          ).requires('myt.InputText','myt.ListViewAnchor');
    file(MYT_COMPONENT_ROOT + 'input/InputTextArea.js'     ).provides('myt.InputTextArea'     ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/EditableText.js'      ).provides('myt.EditableText'      ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/InputSelect.js'       ).provides('myt.InputSelect'       ).requires('myt.NativeInputWrapper','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'input/InputSelectOption.js' ).provides('myt.InputSelectOption' ).requires('myt.InputSelect','myt.Selectable');
    
    // Component : Dimmer
    file(MYT_COMPONENT_ROOT + 'dimmer/Dimmer.js'    ).provides('myt.Dimmer'    ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'dimmer/ModalPanel.js').provides('myt.ModalPanel').requires('myt.Dimmer','myt.SizeToChildren');
    
    // Component : Spinner
    file(MYT_COMPONENT_ROOT + 'spinner/Spinner.js').provides('myt.Spinner').requires('myt.View');
    
    // Component : Dialog
    file(MYT_COMPONENT_ROOT + 'dialog/spectrum.js').provides('$.spectrum'); // Requires JQuery 1.7.0+
    file(MYT_COMPONENT_ROOT + 'dialog/Dialog.js').provides('myt.Dialog').requires('$.spectrum','myt.ModalPanel','myt.DrawButton','myt.Spinner');
    
    // Component : Validator
    file(MYT_COMPONENT_ROOT + 'validator/Validator.js'        ).provides('myt.Validator'        ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'validator/CompoundValidator.js').provides('myt.CompoundValidator').requires('myt.Validator');
    
    file(MYT_COMPONENT_ROOT + 'validator/validators/EqualFieldsValidator.js'     ).provides('myt.EqualFieldsValidator'     ).requires('myt.Validator');
    file(MYT_COMPONENT_ROOT + 'validator/validators/EqualsIgnoreCaseValidator.js').provides('myt.EqualsIgnoreCaseValidator').requires('myt.Validator');
    file(MYT_COMPONENT_ROOT + 'validator/validators/LengthValidator.js'          ).provides('myt.LengthValidator'          ).requires('myt.Validator');
    file(MYT_COMPONENT_ROOT + 'validator/validators/NumericRangeValidator.js'    ).provides('myt.NumericRangeValidator'    ).requires('myt.Validator');
    file(MYT_COMPONENT_ROOT + 'validator/validators/RequiredFieldValidator.js'   ).provides('myt.RequiredFieldValidator'   ).requires('myt.Validator');
    file(MYT_COMPONENT_ROOT + 'validator/validators/URLValidator.js'             ).provides('myt.URLValidator'             ).requires('myt.Validator','myt.URI');
    file(MYT_COMPONENT_ROOT + 'validator/validators/JSONValidator.js'            ).provides('myt.JSONValidator'            ).requires('myt.Validator','JSON');
    
    file(MYT_COMPONENT_ROOT + 'validator/ValidatorRegistry.js').provides('myt.global.validators').requires('myt.global','myt.Observable','myt.CompoundValidator',
                                                                                                           'myt.EqualsIgnoreCaseValidator','myt.RequiredFieldValidator',
                                                                                                           'myt.URLValidator','myt.JSONValidator');
    
    // Component : Form
    file(MYT_COMPONENT_ROOT + 'form/valueprocessor/ValueProcessor.js').provides('myt.ValueProcessor').requires('myt');
    
    file(MYT_COMPONENT_ROOT + 'form/valueprocessor/processors/ToNumberValueProcessor.js'            ).provides('myt.ToNumberValueProcessor'            ).requires('myt.ValueProcessor');
    file(MYT_COMPONENT_ROOT + 'form/valueprocessor/processors/TrimValueProcessor.js'                ).provides('myt.TrimValueProcessor'                ).requires('myt.ValueProcessor');
    file(MYT_COMPONENT_ROOT + 'form/valueprocessor/processors/UndefinedValueProcessor.js'           ).provides('myt.UndefinedValueProcessor'           ).requires('myt.ValueProcessor');
    file(MYT_COMPONENT_ROOT + 'form/valueprocessor/processors/UseOtherFieldIfEmptyValueProcessor.js').provides('myt.UseOtherFieldIfEmptyValueProcessor').requires('myt.ValueProcessor');
    
    file(MYT_COMPONENT_ROOT + 'form/valueprocessor/ValueProcessorRegistry.js').provides('myt.global.valueProcessors').requires('myt.global','myt.Observable','myt.ToNumberValueProcessor',
                                                                                                                               'myt.TrimValueProcessor','myt.UndefinedValueProcessor');
    
    file(MYT_COMPONENT_ROOT + 'form/Form.js'       ).provides('myt.Form'       ).requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'form/RootForm.js'   ).provides('myt.RootForm'   ).requires('myt.Form');
    file(MYT_COMPONENT_ROOT + 'form/FormElement.js').provides('myt.FormElement').requires('myt.RootForm');
    
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputSelect.js'   ).provides('myt.FormInputSelect'   ).requires('myt.FormElement','myt.InputSelectOption');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormRadioGroup.js'    ).provides('myt.FormRadioGroup'    ).requires('myt.FormElement','myt.Radio');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormCheckbox.js'      ).provides('myt.FormCheckbox'      ).requires('myt.FormElement','myt.Checkbox');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormTextCheckbox.js'  ).provides('myt.FormTextCheckbox'  ).requires('myt.FormElement','myt.TextCheckbox');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputTextMixin.js').provides('myt.FormInputTextMixin').requires('myt.FormElement');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputText.js'     ).provides('myt.FormInputText'     ).requires('myt.FormInputTextMixin','myt.InputText');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormComboBox.js'      ).provides('myt.FormComboBox'      ).requires('myt.FormInputTextMixin','myt.ComboBox');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormEditableText.js'  ).provides('myt.FormEditableText'  ).requires('myt.FormInputTextMixin','myt.EditableText');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputTextArea.js' ).provides('myt.FormInputTextArea' ).requires('myt.FormInputTextMixin','myt.InputTextArea');
    
    // Component : Uploader
    file(MYT_COMPONENT_ROOT + 'uploader/DragDropObservable.js').provides('myt.DragDropObservable').requires('myt.DomObservable');
    file(MYT_COMPONENT_ROOT + 'uploader/DragDropSupport.js'   ).provides('myt.DragDropSupport'   ).requires('myt.DragDropObservable','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'uploader/Uploader.js'          ).provides('myt.Uploader'          ).requires('myt.View','myt.NativeInputWrapper','myt.DragDropSupport','myt.Ajax','myt.FormElement');
    file(MYT_COMPONENT_ROOT + 'uploader/ImageUploader.js'     ).provides('myt.ImageUploader'     ).requires('myt.Uploader');
    
    // Component : Graphing
    file(MYT_COMPONENT_ROOT + 'graphing/scatter/KDTree.js'           ).provides('myt.KDTreeNode','myt.BinaryHeap','myt.KDTree').requires('myt');
    file(MYT_COMPONENT_ROOT + 'graphing/scatter/ScatterGraphPoint.js').provides('myt.ScatterGraphPoint'                       ).requires('myt','myt.Selectable');
    file(MYT_COMPONENT_ROOT + 'graphing/scatter/ScatterGraph.js'     ).provides('myt.ScatterGraph'                            ).requires('myt.DelayedMethodCall','myt.Canvas','myt.ScatterGraphPoint',
                                                                                                                                         'myt.global.idle','myt.KDTree','myt.Disableable',
                                                                                                                                         'myt.MouseOver','myt.SelectionManager');
    
    // Include Everything
    file(MYT_ROOT + 'all.js').provides('myt.all').requires(
        'myt.Cookie',
        'myt.global.keys','myt.global.touch','myt.global.history',
        'myt.Text','myt.Markup','myt.SizeWidthToDom','myt.SizeHeightToDom','myt.SizeToParent',
        'myt.SizeToWindowWidth','myt.SizeToWindowHeight',
        'myt.Animator','myt.Callback','myt.RepeatableTimer','myt.StateMachine',
        'myt.Replicator',
        'myt.WrappingLayout','myt.ResizeLayout','myt.AlignedLayout','myt.ThreePanel',
        'myt.DrawButton','myt.SimpleIconTextButton','myt.IconTextPanelButton','myt.DelayedMethodCall',
        'myt.FloatingPanelAnchor',
        'myt.ListViewAnchor',
        'myt.TextCheckbox','myt.TextRadio','myt.TextTabSlider','myt.Tab','myt.SimpleTab',
        'myt.ImageUploader','myt.Dialog',
        'myt.global.validators','myt.EqualFieldsValidator','myt.LengthValidator','myt.NumericRangeValidator',
        'myt.global.valueProcessors','myt.UseOtherFieldIfEmptyValueProcessor',
        'myt.FormElement','myt.FormInputSelect','myt.FormRadioGroup','myt.FormCheckbox','myt.FormTextCheckbox',
        'myt.FormInputText','myt.FormComboBox','myt.FormInputTextArea','myt.FormEditableText',
        'myt.ScatterGraph',
        'myt.Slider','myt.RangeSlider',
        'myt.HorizontalDivider','myt.VerticalDivider',
        'myt.Grid','myt.SimpleGridColumnHeader',
        'myt.PanelStack',
        'myt.DropTarget','myt.DropSource','myt.AutoScroller',
        'myt.Eventable'
    );
}});
