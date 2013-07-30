/** A simple button with support for an icon and text. */
myt.SimpleIconTextButton = new JS.Class('SimpleIconTextButton', myt.SimpleButton, {
    include: [myt.IconTextButtonContent, myt.TooltipMixin]
});
