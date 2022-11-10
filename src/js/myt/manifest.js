JS.Packages(function() {
    const file = this.file;
    
    // Package:myt
    const MYT_ROOT = (global.ROOT || '../src/js/') + 'myt/';
    
    // JS.Class
    file(MYT_ROOT+'../jsclass/core.js').provides('JS.Class','JS.Module','JS.Singleton');
    
    // Shims and Polyfills
    file(MYT_ROOT+'shim/BrowserDetect.js',MYT_ROOT+'shim/language.js').provides('BrowserDetect','Date.prototype.format');
    
    // Util
    const UTIL_ROOT = MYT_ROOT+'util/';
    file(UTIL_ROOT+'Cookie.js',UTIL_ROOT+'LocalStorage.js',UTIL_ROOT+'URI.js',UTIL_ROOT+'Geometry.js')
        .provides('myt.Cookie','myt.LocalStorage','myt.URI','myt.Geometry').requires('myt');
    
    // Core
    const MYT_CORE_ROOT = MYT_ROOT + 'core/';
    file(MYT_CORE_ROOT + 'myt.js'             ).provides('myt').requires('BrowserDetect','Date.prototype.format','JS.Class','JS.Module','JS.Singleton');
    file(MYT_CORE_ROOT + 'AccessorSupport.js' ).provides('myt.AccessorSupport').requires('myt');
    file(MYT_CORE_ROOT + 'Destructible.js'    ).provides('myt.Destructible').requires('myt');
    file(MYT_CORE_ROOT + 'Events.js'          ).provides('myt.Observable','myt.Observer').requires('myt');
    file(MYT_CORE_ROOT + 'Pool.js'            ).provides('myt.Reusable','myt.SimplePool','myt.TrackActivesPool','myt.TrackActivesMultiPool').requires('myt.Destructible');
    file(MYT_CORE_ROOT + 'Eventable.js'       ).provides('myt.Eventable').requires('myt.AccessorSupport','myt.Destructible','myt.Observable','myt.Observer');
    file(MYT_CORE_ROOT + 'Animator.js'        ).provides('myt.Animator').requires('myt.Node','myt.global.idle','myt.Reusable','myt.Color');
    file(MYT_CORE_ROOT + 'Node.js'            ).provides('myt.Node').requires('myt.AccessorSupport','myt.Destructible','myt.Observable','myt.Observer','myt.TrackActivesPool');
    file(MYT_CORE_ROOT + 'Layout.js'          )
        .provides('myt.Layout','myt.ConstantLayout','myt.VariableLayout','myt.SpacedLayout','myt.ResizeLayout','myt.WrappingLayout','myt.AlignedLayout')
        .requires('myt.Node');
    file(MYT_CORE_ROOT + 'DomElementProxy.js' ).provides('myt.DomElementProxy').requires('myt');
    file(MYT_CORE_ROOT + 'DomEvents.js')
        .provides('myt.DomObservable','myt.DomObserver','myt.MouseObservable','myt.KeyObservable','myt.FocusObservable','myt.ScrollObservable','myt.TouchObservable','myt.InputObservable','myt.DragDropObservable')
        .requires('myt.DomElementProxy','myt.global.focus');
    file(MYT_CORE_ROOT + 'View.js'            ).provides('myt.View')
        .requires('myt.Layout','myt.MouseObservable','myt.KeyObservable','myt.DomObserver','myt.FocusObservable','myt.ScrollObservable','myt.Geometry');
    file(MYT_CORE_ROOT + 'RootView.js'        ).provides('myt.RootView').requires('myt.View','myt.global.roots');
    file(MYT_CORE_ROOT + 'ImageSupport.js'    ).provides('myt.ImageSupport').requires('myt.View');
    file(MYT_CORE_ROOT + 'TransformSupport.js').provides('myt.TransformSupport').requires('myt.View');
    file(MYT_CORE_ROOT + 'SizeToDom.js'       )
        .provides('myt.SizeToDom','myt.SizeWidthToDom','myt.SizeHeightToDom').requires('myt.TransformSupport');
    file(MYT_CORE_ROOT + 'TextSupport.js'     ).provides('myt.TextSupport','myt.PaddedTextSupport').requires('myt.SizeToDom');
    file(MYT_CORE_ROOT + 'FlexboxSupport.js'  ).provides('myt.FlexboxSupport','myt.FlexboxChildSupport').requires('myt');
    
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
    file(MYT_GLOBALS_ROOT + 'GlobalWindowResize.js'    ).provides('myt.global.windowResize').requires('myt.global.idle');
    file(MYT_GLOBALS_ROOT + 'GlobalRootViewRegistry.js').provides('myt.global.roots'       ).requires('myt.global');
    
    // Component
    const MYT_COMPONENT_ROOT = MYT_ROOT + 'component/';
    file(MYT_COMPONENT_ROOT + 'Annulus.js'         ).provides('myt.Annulus').requires('myt.BackView');
    file(MYT_COMPONENT_ROOT + 'BAG.js'             ).provides('myt.BAG','myt.BAGMembership').requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'BaseViews.js'       ).provides('myt.Flexbox','myt.Frame','myt.Markup','myt.Text','myt.PaddedText','myt.Image','myt.BackView')
        .requires('myt.View','myt.FlexboxSupport','myt.TextSupport','myt.PaddedTextSupport','myt.ImageSupport','myt.SizeToDom');
    file(MYT_COMPONENT_ROOT + 'Behavior.js'        )
        .provides('myt.Activateable','myt.UpdateableUI','myt.Disableable','myt.KeyActivation','myt.MouseOver','myt.MouseDown','myt.MouseOverAndDown','myt.Draggable')
        .requires('myt.global.keys','myt.global.mouse','myt.global.idle','myt.global.dragManager','myt.AccessorSupport','myt.MouseObservable','myt.KeyObservable','myt.FocusObservable','myt.Geometry');
    file(MYT_COMPONENT_ROOT + 'Button.js'          )
        .provides('myt.Button','myt.SimpleButtonStyle','myt.SimpleButton','myt.SimpleTextButton','myt.TextButton')
        .requires('myt.UpdateableUI','myt.MouseOverAndDown','myt.KeyActivation','myt.Disableable','myt.View','myt.Image','myt.Text','myt.PaddedText');
    file(MYT_COMPONENT_ROOT + 'Canvas.js'          ).provides('myt.Canvas' ).requires('myt.BackView','myt.Path','myt.Color');
    file(MYT_COMPONENT_ROOT + 'Checkbox.js'        ).provides('myt.Checkbox').requires('myt.SimpleButtonStyle','myt.ValueComponent');
    file(MYT_COMPONENT_ROOT + 'Color.js'           ).provides('myt.Color').requires('myt');
    file(MYT_COMPONENT_ROOT + 'Dialog.js'          ).provides('myt.Dialog','myt.ColorPicker','myt.DatePicker')
        .requires('myt.ModalPanel','myt.Spinner','myt.TextButton','myt.Color','myt.Text','myt.FontAwesome', 'myt.Draggable','myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'Dimmer.js'          ).provides('myt.Dimmer','myt.ModalPanel').requires('myt.RootView','myt.SizeToChildren');
    file(MYT_COMPONENT_ROOT + 'Divider.js'         ).provides('myt.HorizontalDivider','myt.VerticalDivider').requires('myt.SimpleButton','myt.BoundedValueComponent','myt.Draggable');
    file(MYT_COMPONENT_ROOT + 'FloatingPanel.js'   ).provides('myt.FloatingPanelAnchor','myt.FloatingPanel').requires('myt.RootView','myt.global.mouse','myt.global.focus');
    file(MYT_COMPONENT_ROOT + 'FontAwesome.js'     ).provides('myt.FontAwesome').requires('myt.Markup');
    file(MYT_COMPONENT_ROOT + 'Form.js'            )
        .provides(
            'myt.Form','myt.FormElement','myt.RootForm',
            'myt.FormInputTextMixin','myt.FormInputSelect','myt.FormRadioGroup','myt.FormCheckbox','myt.FormInputText',
            'myt.FormComboBox','myt.FormEditableText','myt.FormInputTextArea','myt.ValueProcessor','myt.ToNumberValueProcessor',
            'myt.TrimValueProcessor','myt.UndefinedValueProcessor','myt.UseOtherFieldIfEmptyValueProcessor','myt.global.valueProcessors'
        )
        .requires('myt.global.focus','myt.InputSelectOption','myt.Radio','myt.ValueComponent','myt.Checkbox','myt.InputText','myt.ComboBox','myt.EditableText','myt.InputTextArea');
    file(MYT_COMPONENT_ROOT + 'Grid.js'            )
        .provides('myt.GridController','myt.GridColHdr','myt.SimpleGridColHdr','myt.Grid','myt.GridRow')
        .requires('myt.View','myt.BoundedValueComponent','myt.SimpleTextButton','myt.FontAwesome');
    file(MYT_COMPONENT_ROOT + 'InfiniteList.js'    )
        .provides(
            'myt.InfiniteList','myt.InfiniteListRow','myt.SelectableInfiniteList','myt.SelectableInfiniteListRow','myt.SimpleSelectableInfiniteListRow',
            'myt.InfiniteGrid','myt.InfiniteGridRow','myt.InfiniteGridHeader','myt.SelectableInfiniteGrid','myt.SelectableInfiniteGridRow','myt.SimpleSelectableInfiniteGridRow'
        )
        .requires('myt.Reusable','myt.Selectable','myt.SimpleButton','myt.GridController','myt.global.focus','myt.global.keys');
    file(MYT_COMPONENT_ROOT + 'ListView.js'        ).provides('myt.ListView','myt.ListViewAnchor','myt.ListViewItemMixin','myt.ListViewSeparator','myt.ListViewItem')
        .requires('myt.FloatingPanel','myt.FloatingPanelAnchor','myt.SimpleTextButton','myt.global.focus','myt.global.keys');
    file(MYT_COMPONENT_ROOT + 'ModelMixins.js'     ).provides('myt.ValueComponent','myt.RangeComponent','myt.BoundedValueComponent','myt.BoundedRangeComponent').requires('myt');
    file(MYT_COMPONENT_ROOT + 'NativeInput.js'     )
        .provides('myt.NativeInputWrapper','myt.BaseInputText','myt.InputText','myt.ComboBox','myt.InputTextArea','myt.EditableText','myt.InputSelect','myt.InputSelectOption')
        .requires('myt.Button','myt.InputObservable','myt.ListViewAnchor','myt.SizeToDom','myt.Selectable');
    file(MYT_COMPONENT_ROOT + 'PanelStack.js'      )
        .provides('myt.PanelStack','myt.StackablePanel','myt.PanelStackTransition','myt.PanelStackFadeTransition','myt.PanelStackSlideTransition')
        .requires('myt.View','myt.SelectionManager');
    file(MYT_COMPONENT_ROOT + 'Path.js'            ).provides('myt.Path' ).requires('myt');
    file(MYT_COMPONENT_ROOT + 'Radio.js'           ).provides('myt.Radio').requires('myt.SimpleButtonStyle','myt.BAG');
    file(MYT_COMPONENT_ROOT + 'Replicator.js'      ).provides('myt.Replicable','myt.Replicator').requires('myt.Reusable','myt.Node','myt.TrackActivesPool');
    file(MYT_COMPONENT_ROOT + 'SelectionManager.js').provides('myt.SelectionManager','myt.Selectable').requires('myt.global.keys');
    file(MYT_COMPONENT_ROOT + 'SizeToChildren.js'  ).provides('myt.SizeToChildren').requires('myt.Layout');
    file(MYT_COMPONENT_ROOT + 'SizeToParent.js'    ).provides('myt.SizeToParent'  ).requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'SizeToWindow.js'    ).provides('myt.SizeToWindow','myt.SizeToWindowWidth','myt.SizeToWindowHeight').requires('myt.RootView','myt.global.windowResize');
    file(MYT_COMPONENT_ROOT + 'Slider.js'          ).provides('myt.BaseSlider','myt.Slider','myt.RangeSlider')
        .requires('myt.View','myt.Draggable','myt.Disableable','myt.BoundedValueComponent','myt.BoundedRangeComponent','myt.SimpleButton');
    file(MYT_COMPONENT_ROOT + 'Spinner.js'         ).provides('myt.Spinner').requires('myt.View');
    file(MYT_COMPONENT_ROOT + 'StateMachine.js'    ).provides('myt.StateMachine').requires('myt.Node');
    file(MYT_COMPONENT_ROOT + 'Tab.js'             ).provides('myt.TabContainer','myt.Tab').requires('myt.SelectionManager','myt.Selectable','myt.SimpleTextButton');
    file(MYT_COMPONENT_ROOT + 'TabSlider.js'       ).provides('myt.TabSliderContainer','myt.TabSlider','myt.TextTabSlider').requires('myt.SelectionManager','myt.SimpleButton');
    file(MYT_COMPONENT_ROOT + 'Tooltip.js'         )
        .provides('myt.TooltipMixin','myt.BaseTooltip','myt.Tooltip')
        .requires('myt.RootView','myt.global.mouse','myt.global.dragManager','myt.global.windowResize');
    file(MYT_COMPONENT_ROOT + 'Uploader.js'        ).provides('myt.DragDropSupport','myt.Uploader','myt.ImageUploader')
        .requires('myt.DragDropObservable','myt.Disableable','myt.Image','myt.NativeInputWrapper','myt.FormElement');
    file(MYT_COMPONENT_ROOT + 'Validator.js'       )
        .provides('myt.global.validators','myt.Validator','myt.CompoundValidator',
            'myt.EqualFieldsValidator','myt.EqualsIgnoreCaseValidator','myt.LengthValidator',
            'myt.NumericRangeValidator','myt.URLValidator','myt.RequiredFieldValidator','myt.JSONValidator')
        .requires('myt.global','myt.URI');
    file(MYT_COMPONENT_ROOT + 'DragAndDrop.js'     ).provides('myt.DragGroupSupport','myt.Dropable','myt.DropTarget','myt.DropSource','myt.AutoScroller')
        .requires('myt.View','myt.Draggable','myt.global.mouse','myt.global.dragManager');
    
    // Include Everything
    file(MYT_ROOT + 'all.js').provides('myt.all').requires(
        'myt.Cookie','myt.LocalStorage',
        'myt.global.error','myt.global.keys','myt.global.touch',
        'myt.FlexboxChildSupport','myt.Flexbox','myt.Text','myt.Image','myt.Markup','myt.Frame',
        'myt.SizeToParent','myt.SizeToWindow',
        'myt.Animator','myt.StateMachine','myt.Replicator',
        'myt.WrappingLayout','myt.ResizeLayout','myt.AlignedLayout',
        'myt.SimpleTextButton','myt.FloatingPanel','myt.ListViewAnchor',
        'myt.Radio','myt.TextTabSlider','myt.Tab','myt.ImageUploader','myt.Dialog',
        'myt.global.validators','myt.global.valueProcessors','myt.UseOtherFieldIfEmptyValueProcessor',
        'myt.FormElement','myt.FormInputSelect','myt.FormRadioGroup','myt.FormCheckbox','myt.FormInputText','myt.FormComboBox','myt.FormInputTextArea','myt.FormEditableText',
        'myt.Slider','myt.RangeSlider','myt.HorizontalDivider','myt.VerticalDivider',
        'myt.Grid','myt.SimpleGridColHdr','myt.InfiniteGrid',
        'myt.SelectableInfiniteList','myt.SimpleSelectableInfiniteListRow',
        'myt.PanelStack','myt.AutoScroller','myt.Eventable','myt.Annulus',
        'myt.TooltipMixin','myt.Canvas'
    );
});
