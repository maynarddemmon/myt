JS.Packages(file => {
    // Package:tym
    const TYM_ROOT = '../src/js/tym/';
    
    file(TYM_ROOT + '_prefix.js').provides('global');
    
    // JS.Class
    file(TYM_ROOT+'../jsclass/core.js').provides('JS.Class','JS.Module','JS.Singleton').requires('global');
    
    // tym
    file(TYM_ROOT + 'tym.js').provides('tym').requires('JS.Class','JS.Module','JS.Singleton');
    
    file(TYM_ROOT + 'AccessorSupport.js' ).provides('tym.AccessorSupport').requires('tym');
    file(TYM_ROOT + 'Destructible.js'    ).provides('tym.Destructible').requires('tym');
    file(TYM_ROOT + 'Events.js'          ).provides('tym.Observable','tym.Observer').requires('tym');
    file(TYM_ROOT + 'Pool.js'            ).provides('tym.Reusable','tym.SimplePool','tym.TrackActivesPool','tym.TrackActivesMultiPool').requires('tym.Destructible');
    file(TYM_ROOT + 'Node.js'            ).provides('tym.Eventable','tym.Node').requires('tym.AccessorSupport','tym.Destructible','tym.Observable','tym.Observer');
    
    // Include Everything
    file(TYM_ROOT + 'all.js').provides('tym.all').requires(
        'tym.Node','tym.TrackActivesPool'
    );
});
