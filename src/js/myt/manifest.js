JS.Packages(function() {
    const file = this.file;
    
    // Package:myt
    const MYT_ROOT = global.MYT_ROOT || '../js/myt/';
    
    // JS.Class
    file(MYT_ROOT+'../jsclass/core.js').provides('JS.Class','JS.Module','JS.Singleton');
    
    // Shims and Polyfills
    file(MYT_ROOT+'shim/BrowserDetect.js',MYT_ROOT+'shim/language.js').provides('BrowserDetect','Date.prototype.format');
    
    // Util
    const UTIL_ROOT = MYT_ROOT+'util/';
    file(UTIL_ROOT+'Cookie.js',UTIL_ROOT+'LocalStorage.js',UTIL_ROOT+'URI.js',UTIL_ROOT+'Geometry.js')
        .provides('myt.Cookie','myt.LocalStorage','myt.URI','myt.Geometry')
        .requires('myt');
    
    // Core
    const MYT_CORE_ROOT = MYT_ROOT + 'core/';
    file(MYT_CORE_ROOT + 'myt.js').provides('myt').requires('BrowserDetect','Date.prototype.format','JS.Class','JS.Module','JS.Singleton');
    
    file(MYT_CORE_ROOT + 'AccessorSupport.js').provides('myt.AccessorSupport').requires('myt');
    file(MYT_CORE_ROOT + 'Destructible.js'   ).provides('myt.Destructible').requires('myt');
    file(MYT_CORE_ROOT + 'Events.js'         ).provides('myt.Observable','myt.Observer').requires('myt');
    file(MYT_CORE_ROOT + 'Pool.js'           ).provides('myt.Reusable','myt.SimplePool','myt.TrackActivesPool','myt.TrackActivesMultiPool').requires('myt.Destructible');
    file(MYT_CORE_ROOT + 'Eventable.js'      ).provides('myt.Eventable').requires('myt.AccessorSupport','myt.Destructible','myt.Observable','myt.Observer');
    file(MYT_CORE_ROOT + 'Animator.js'       ).provides('myt.Animator').requires('myt.Node','myt.global.idle','myt.Reusable');
    file(MYT_CORE_ROOT + 'Node.js'           ).provides('myt.Node').requires('myt.AccessorSupport','myt.Destructible','myt.Observable','myt.Observer','myt.TrackActivesPool');
    file(MYT_CORE_ROOT + 'Layout.js'         ).provides('myt.Layout','myt.ConstantLayout','myt.VariableLayout').requires('myt.Node');
    
    // Core : View
    const MYT_VIEW_ROOT = MYT_CORE_ROOT + 'view/';
    file(MYT_VIEW_ROOT + 'DomElementProxy.js'    ).provides('myt.DomElementProxy'    ).requires('myt');
    file(MYT_VIEW_ROOT + 'DomEvents.js')
        .provides('myt.DomObservable','myt.DomObserver','myt.MouseObservable','myt.KeyObservable',
            'myt.FocusObservable','myt.ScrollObservable','myt.TouchObservable','myt.InputObservable',
            'myt.DragDropObservable')
        .requires('myt.DomElementProxy','myt.global.focus');
    file(MYT_VIEW_ROOT + 'View.js'               ).provides('myt.View'               )
        .requires('myt.Layout','myt.MouseObservable','myt.KeyObservable','myt.DomObserver','myt.FocusObservable','myt.ScrollObservable','myt.Geometry');
    file(MYT_VIEW_ROOT + 'RootView.js'           ).provides('myt.RootView'           ).requires('myt.View','myt.global.roots');
    file(MYT_VIEW_ROOT + 'ImageSupport.js'       ).provides('myt.ImageSupport'       ).requires('myt.View');
    file(MYT_VIEW_ROOT + 'TransformSupport.js'   ).provides('myt.TransformSupport'   ).requires('myt.View');
    file(MYT_VIEW_ROOT + 'SizeToDom.js'          ).provides('myt.SizeToDom'          ).requires('myt.TransformSupport');
    file(MYT_VIEW_ROOT + 'TextSupport.js'        ).provides('myt.TextSupport'        ).requires('myt.SizeToDom');
    file(MYT_VIEW_ROOT + 'FlexBoxSupport.js'     ).provides('myt.FlexBoxSupport'     ).requires('myt');
    file(MYT_VIEW_ROOT + 'FlexBoxChildSupport.js').provides('myt.FlexBoxChildSupport').requires('myt');
    
    // Core : Globals
    const MYT_GLOBALS_ROOT = MYT_CORE_ROOT + 'globals/';
    file(MYT_GLOBALS_ROOT + 'Global.js'                ).provides('myt.global'             ).requires('myt.Observable');
    file(MYT_GLOBALS_ROOT + 'GlobalError.js'           ).provides('myt.global.error'       ).requires('myt.global');
    file(MYT_GLOBALS_ROOT + 'GlobalIdle.js'            ).provides('myt.global.idle'        ).requires('myt.global');
    file(MYT_GLOBALS_ROOT + 'GlobalMouse.js'           ).provides('myt.global.mouse'       ).requires('myt.global','myt.DomObservable','myt.MouseObservable');
    file(MYT_GLOBALS_ROOT + 'GlobalTouch.js'           ).provides('myt.global.touch'       ).requires('myt.global','myt.DomObservable','myt.TouchObservable');
    file(MYT_GLOBALS_ROOT + 'GlobalFocus.js'           ).provides('myt.global.focus'       ).requires('myt.global');
    file(MYT_GLOBALS_ROOT + 'GlobalKeys.js'            ).provides('myt.global.keys'        ).requires('myt.global','myt.DomObserver','myt.KeyObservable','myt.global.focus','myt.Observer');
    file(MYT_GLOBALS_ROOT + 'GlobalDragManager.js'     ).provides('myt.global.dragManager' ).requires('myt.global');
    file(MYT_GLOBALS_ROOT + 'GlobalWindowResize.js'    ).provides('myt.global.windowResize').requires('myt.global');
    file(MYT_GLOBALS_ROOT + 'GlobalRootViewRegistry.js').provides('myt.global.roots'       ).requires('myt.global');
    
    // Component
    const MYT_COMPONENT_ROOT = MYT_ROOT + 'component/';
    
    // Component : Misc
    file(MYT_COMPONENT_ROOT + 'Button.js'          )
        .provides('myt.Button','myt.SimpleButtonStyle','myt.SimpleButton','myt.SimpleIconTextButton','myt.SimpleTextButton','myt.IconTextButtonContent','myt.TextButtonContent')
        .requires('myt.UpdateableUI','myt.MouseOverAndDown','myt.KeyActivation','myt.Disableable','myt.View','myt.Image','myt.Text');
    file(MYT_COMPONENT_ROOT + 'Checkbox.js'        ).provides('myt.Checkbox').requires('myt.SimpleButtonStyle','myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'Color.js'           ).provides('myt.Color').requires('myt');
    file(MYT_COMPONENT_ROOT + 'Dimmer.js'          ).provides('myt.Dimmer').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'Divider.js'         ).provides('myt.HorizontalDivider','myt.VerticalDivider').requires('myt.SimpleButton','myt.BoundedValueComponent','myt.Draggable');
    file(MYT_COMPONENT_ROOT + 'FloatingPanel.js'   ).provides('myt.FloatingPanelAnchor','myt.FloatingPanel').requires('myt.RootView','myt.global.mouse','myt.global.focus');
    file(MYT_COMPONENT_ROOT + 'FontAwesome.js'     ).provides('myt.FontAwesome').requires('myt.Markup');
    file(MYT_COMPONENT_ROOT + 'ListView.js'        )
        .provides('myt.ListView','myt.ListViewAnchor','myt.ListViewItemMixin','myt.ListViewSeparator','myt.ListViewItem')
        .requires('myt.FloatingPanel','myt.FloatingPanelAnchor','myt.SimpleIconTextButton');
    file(MYT_COMPONENT_ROOT + 'ModalPanel.js'      ).provides('myt.ModalPanel').requires('myt.Dimmer','myt.SizeToChildren');
    file(MYT_COMPONENT_ROOT + 'Path.js'            ).provides('myt.Path' ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'Radio.js'           ).provides('myt.Radio').requires('myt.SimpleButtonStyle','myt.BAG');
    file(MYT_COMPONENT_ROOT + 'Replicator.js'      ).provides('myt.Replicable','myt.Replicator').requires('myt.Reusable','myt.Node','myt.TrackActivesPool');
    file(MYT_COMPONENT_ROOT + 'SelectionManager.js').provides('myt.SelectionManager','myt.Selectable').requires('myt.global.keys');
    file(MYT_COMPONENT_ROOT + 'Spinner.js'         ).provides('myt.Spinner').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'StateMachine.js'    ).provides('myt.StateMachine').requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'Tooltip.js'         ).provides('myt.TooltipMixin','myt.BaseTooltip','myt.Tooltip')
        .requires('myt.RootView','myt.global.mouse','myt.global.dragManager','myt.global.windowResize');
    file(MYT_COMPONENT_ROOT + 'Validator.js'       )
        .provides('myt.global.validators','myt.Validator','myt.CompoundValidator',
            'myt.EqualFieldsValidator','myt.EqualsIgnoreCaseValidator','myt.LengthValidator',
            'myt.NumericRangeValidator','myt.URLValidator','myt.RequiredFieldValidator','myt.JSONValidator')
        .requires('myt.global','myt.URI');
    file(MYT_COMPONENT_ROOT + 'WebSocket.js'       ).provides('myt.WebSocket','myt.MessageTypeWebSocket').requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'DragAndDrop.js'     )
        .provides('myt.DragGroupSupport','myt.Dropable','myt.DropTarget','myt.DropSource','myt.AutoScroller')
        .requires('myt.View','myt.Draggable','myt.global.mouse','myt.global.dragManager');
    
    // Component : Base
    file(MYT_COMPONENT_ROOT + 'base/Annulus.js').provides('myt.Annulus').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'base/Text.js'   ).provides('myt.Text'   ).requires('myt.TextSupport');
    file(MYT_COMPONENT_ROOT + 'base/Markup.js' ).provides('myt.Markup' ).requires('myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'base/Canvas.js' ).provides('myt.Canvas' ).requires('myt.View','myt.Path','myt.Color');
    file(MYT_COMPONENT_ROOT + 'base/Frame.js'  ).provides('myt.Frame'  ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'base/Image.js'  ).provides('myt.Image'  ).requires('myt.ImageSupport');
    file(MYT_COMPONENT_ROOT + 'base/FlexBox.js').provides('myt.FlexBox').requires('myt.View','myt.FlexBoxSupport');
    
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
    
    // Component : Model
    file(MYT_COMPONENT_ROOT + 'model/BAGMembership.js'        ).provides('myt.BAGMembership'        ).requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'model/BAG.js'                  ).provides('myt.BAG'                  ).requires('myt.BAGMembership');
    file(MYT_COMPONENT_ROOT + 'model/ValueComponent.js'       ).provides('myt.ValueComponent'       ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'model/BoundedValueComponent.js').provides('myt.BoundedValueComponent').requires('myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'model/RangeComponent.js'       ).provides('myt.RangeComponent'       ).requires('myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'model/BoundedRangeComponent.js').provides('myt.BoundedRangeComponent').requires('myt.RangeComponent','myt.BoundedValueComponent');
    
    // Component : Grid
    file(MYT_COMPONENT_ROOT + 'grid/GridColumnHeader.js'      ).provides('myt.GridColumnHeader'      ).requires('myt.View','myt.BoundedValueComponent');
    file(MYT_COMPONENT_ROOT + 'grid/SimpleGridColumnHeader.js').provides('myt.SimpleGridColumnHeader').requires('myt.GridColumnHeader','myt.SimpleIconTextButton','myt.FontAwesome');
    file(MYT_COMPONENT_ROOT + 'grid/GridController.js'        ).provides('myt.GridController'        ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'grid/Grid.js'                  ).provides('myt.Grid','myt.GridRow'    ).requires('myt.GridController','myt.GridColumnHeader');
    
    // Component : Infinite
    file(MYT_COMPONENT_ROOT + 'infinite/InfiniteList.js'          ).provides('myt.InfiniteList','myt.InfiniteListRow').requires('myt.View','myt.Reusable');
    file(MYT_COMPONENT_ROOT + 'infinite/SelectableInfiniteList.js').provides('myt.SelectableInfiniteList','myt.SelectableInfiniteListRow','myt.SimpleSelectableInfiniteListRow')
        .requires('myt.InfiniteList','myt.Selectable','myt.SimpleButton');
    file(MYT_COMPONENT_ROOT + 'infinite/InfiniteGrid.js'          )
        .provides('myt.InfiniteGrid','myt.InfiniteGridRow','myt.InfiniteGridHeader','myt.SelectableInfiniteGrid','myt.SelectableInfiniteGridRow','myt.SimpleSelectableInfiniteGridRow')
        .requires('myt.SelectableInfiniteList','myt.GridController');
    
    // Component : Slider
    file(MYT_COMPONENT_ROOT + 'slider/SliderThumbMixin.js'     ).provides('myt.SliderThumbMixin'     ).requires('myt.View','myt.Draggable');
    file(MYT_COMPONENT_ROOT + 'slider/SimpleSliderThumb.js'    ).provides('myt.SimpleSliderThumb'    ).requires('myt.SliderThumbMixin','myt.SimpleButton');
    file(MYT_COMPONENT_ROOT + 'slider/BaseSlider.js'           ).provides('myt.BaseSlider'           ).requires('myt.Disableable','myt.SimpleSliderThumb');
    file(MYT_COMPONENT_ROOT + 'slider/Slider.js'               ).provides('myt.Slider'               ).requires('myt.BoundedValueComponent','myt.BaseSlider');
    file(MYT_COMPONENT_ROOT + 'slider/SimpleSliderRangeFill.js').provides('myt.SimpleSliderRangeFill').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'slider/RangeSlider.js'          ).provides('myt.RangeSlider'          ).requires('myt.BoundedRangeComponent','myt.BaseSlider','myt.SimpleSliderRangeFill');
    
    // Component : Tab Slider
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSliderContainer.js').provides('myt.TabSliderContainer').requires('myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'tabslider/TabSlider.js'         ).provides('myt.TabSlider'         ).requires('myt.SimpleButton','myt.TabSliderContainer');
    file(MYT_COMPONENT_ROOT + 'tabslider/TextTabSlider.js'     ).provides('myt.TextTabSlider'     ).requires('myt.TabSlider');
    
    // Component : Tab
    file(MYT_COMPONENT_ROOT + 'tab/TabContainer.js').provides('myt.TabContainer').requires('myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'tab/TabMixin.js'    ).provides('myt.TabMixin'    ).requires('myt.Selectable','myt.TabContainer');
    file(MYT_COMPONENT_ROOT + 'tab/Tab.js'         ).provides('myt.Tab'         ).requires('myt.SimpleIconTextButton','myt.TabMixin');
    
    // Component : Panel Stack
    file(MYT_COMPONENT_ROOT + 'panelstack/StackablePanel.js'           ).provides('myt.StackablePanel'           ).requires('myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'panelstack/PanelStackTransition.js'     ).provides('myt.PanelStackTransition'     ).requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'panelstack/PanelStackFadeTransition.js' ).provides('myt.PanelStackFadeTransition' ).requires('myt.PanelStackTransition');
    file(MYT_COMPONENT_ROOT + 'panelstack/PanelStackSlideTransition.js').provides('myt.PanelStackSlideTransition').requires('myt.PanelStackTransition');
    file(MYT_COMPONENT_ROOT + 'panelstack/PanelStack.js'               ).provides('myt.PanelStack'               )
        .requires('myt.StackablePanel','myt.PanelStackFadeTransition','myt.PanelStackSlideTransition','myt.View');
    
    // Component : Input
    file(MYT_COMPONENT_ROOT + 'input/NativeInputWrapper.js').provides('myt.NativeInputWrapper').requires('myt.View','myt.InputObservable','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'input/BaseInputText.js'     ).provides('myt.BaseInputText'     ).requires('myt.NativeInputWrapper','myt.TextSupport');
    file(MYT_COMPONENT_ROOT + 'input/InputText.js'         ).provides('myt.InputText'         ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/ComboBox.js'          ).provides('myt.ComboBox'          ).requires('myt.InputText','myt.ListViewAnchor');
    file(MYT_COMPONENT_ROOT + 'input/InputTextArea.js'     ).provides('myt.InputTextArea'     ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/EditableText.js'      ).provides('myt.EditableText'      ).requires('myt.BaseInputText');
    file(MYT_COMPONENT_ROOT + 'input/InputSelect.js'       ).provides('myt.InputSelect'       ).requires('myt.NativeInputWrapper','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'input/InputSelectOption.js' ).provides('myt.InputSelectOption' ).requires('myt.InputSelect','myt.Selectable');
    
    // Component : Dialog
    file(MYT_COMPONENT_ROOT + 'dialog/spectrum.js').provides('$.spectrum').requires('myt.Color'); // Requires JQuery 1.7.0+
    file(MYT_COMPONENT_ROOT + 'dialog/simple-dtpicker.js').provides('$.fn.dtpicker'); // Requires JQuery 1.7.2+
    file(MYT_COMPONENT_ROOT + 'dialog/Dialog.js').provides('myt.Dialog').requires('$.spectrum','$.fn.dtpicker','myt.ModalPanel','myt.Spinner','myt.SimpleButton');
    
    // Component : Form
    file(MYT_COMPONENT_ROOT + 'form/ValueProcessor.js')
        .provides('myt.ValueProcessor','myt.ToNumberValueProcessor','myt.TrimValueProcessor','myt.UndefinedValueProcessor','myt.UseOtherFieldIfEmptyValueProcessor','myt.global.valueProcessors')
        .requires('myt.global');
    
    file(MYT_COMPONENT_ROOT + 'form/Form.js'       ).provides('myt.Form'       ).requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'form/RootForm.js'   ).provides('myt.RootForm'   ).requires('myt.Form');
    file(MYT_COMPONENT_ROOT + 'form/FormElement.js').provides('myt.FormElement').requires('myt.RootForm');
    
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputSelect.js'   ).provides('myt.FormInputSelect'   ).requires('myt.FormElement','myt.InputSelectOption');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormRadioGroup.js'    ).provides('myt.FormRadioGroup'    ).requires('myt.FormElement','myt.Radio','myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormCheckbox.js'      ).provides('myt.FormCheckbox'      ).requires('myt.FormElement','myt.Checkbox');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputTextMixin.js').provides('myt.FormInputTextMixin').requires('myt.FormElement');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputText.js'     ).provides('myt.FormInputText'     ).requires('myt.FormInputTextMixin','myt.InputText');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormComboBox.js'      ).provides('myt.FormComboBox'      ).requires('myt.FormInputTextMixin','myt.ComboBox');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormEditableText.js'  ).provides('myt.FormEditableText'  ).requires('myt.FormInputTextMixin','myt.EditableText');
    file(MYT_COMPONENT_ROOT + 'form/elements/FormInputTextArea.js' ).provides('myt.FormInputTextArea' ).requires('myt.FormInputTextMixin','myt.InputTextArea');
    
    // Component : Uploader
    file(MYT_COMPONENT_ROOT + 'uploader/DragDropSupport.js').provides('myt.DragDropSupport').requires('myt.DragDropObservable','myt.Disableable');
    file(MYT_COMPONENT_ROOT + 'uploader/Uploader.js'       ).provides('myt.Uploader'       )
        .requires('myt.View','myt.NativeInputWrapper','myt.DragDropSupport','myt.FormElement');
    file(MYT_COMPONENT_ROOT + 'uploader/ImageUploader.js'  ).provides('myt.ImageUploader'  ).requires('myt.Uploader');
    
    // Include Everything
    file(MYT_ROOT + 'all.js').provides('myt.all').requires(
        'myt.Cookie','myt.LocalStorage',
        'myt.global.error','myt.global.keys','myt.global.touch',
        'myt.FlexBoxChildSupport','myt.FlexBox','myt.Text','myt.Image','myt.Markup','myt.Frame',
        'myt.SizeWidthToDom','myt.SizeHeightToDom','myt.SizeToParent',
        'myt.SizeToWindowWidth','myt.SizeToWindowHeight',
        'myt.Animator','myt.StateMachine',
        'myt.Replicator',
        'myt.WrappingLayout','myt.ResizeLayout','myt.AlignedLayout',
        'myt.SimpleIconTextButton',
        'myt.FloatingPanel',
        'myt.ListViewAnchor',
        'myt.Radio','myt.TextTabSlider','myt.Tab',
        'myt.ImageUploader','myt.Dialog',
        'myt.global.validators',
        'myt.global.valueProcessors','myt.UseOtherFieldIfEmptyValueProcessor',
        'myt.FormElement','myt.FormInputSelect','myt.FormRadioGroup','myt.FormCheckbox',
        'myt.FormInputText','myt.FormComboBox','myt.FormInputTextArea','myt.FormEditableText',
        'myt.Slider','myt.RangeSlider',
        'myt.HorizontalDivider','myt.VerticalDivider',
        'myt.Grid','myt.SimpleGridColumnHeader',
        'myt.InfiniteGrid',
        'myt.SelectableInfiniteList','myt.SimpleSelectableInfiniteListRow',
        'myt.PanelStack',
        'myt.AutoScroller',
        'myt.Eventable',
        'myt.Annulus',
        'myt.MessageTypeWebSocket',
        'myt.TooltipMixin',
        'myt.Canvas'
    );
});
