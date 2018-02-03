/*
    Hello source-viewers!
    We're glad you're interested in how Tangram can be used to make amazing maps!
    - The Mapzen Tangram team
*/

(function () {
    var scene_url = './scene.yaml';

    // Create Tangram as a Leaflet layer
    var layer = Tangram.leafletLayer({
        scene: scene_url,
        events: {
            hover: onHover,     // hover event (defined below)
            click: onClick      // click event (defined below)
        },
        // debug: {
        //     layer_stats: true // enable to collect detailed layer stats, access w/`scene.debug.layerStats()`
        // },
        logLevel: 'debug',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    // Create a Leaflet map
    var map = L.map('map', {
        maxZoom: 20,
        zoomSnap: 0,
        keyboard: false
    });

    // Set the map location (will be overwritten if location URL params present)
    var map_start_location = [16, 40.70531887544228, -74.00976419448853]; // NYC
    map.setView(map_start_location);

    // Useful events to subscribe to
    layer.scene.subscribe({
        load: function (msg) {
            // scene was loaded
        },
        update: function (msg) {
            // scene updated
        },
        pre_update: function (will_render) {
            // before scene update
            // zoom in/out if up/down arrows pressed
            var zoom_step = 0.03;
            if (key.isPressed('up')) {
                map._move(map.getCenter(), map.getZoom() + zoom_step);
                map._moveEnd(true);
            }
            else if (key.isPressed('down')) {
                map._move(map.getCenter(), map.getZoom() - zoom_step);
                map._moveEnd(true);
            }
        },
        post_update: function (will_render){
            // after scene update
        },
        view_complete: function (msg) {
            // new set of map tiles was rendered
        },
        error: function (msg) {
            // on error
        },
        warning: function (msg) {
            // on warning
        }
    });

    // Feature selection
    var tooltip = L.tooltip();
    layer.bindTooltip(tooltip);
    map.on('zoom', function(){ layer.closeTooltip() }); // close tooltip when zooming

    function onHover (selection) {
        var feature = selection.feature;
        if (feature) {
            if (selection.changed) {
                var info;
                if (scene.introspection) {
                    info = getFeaturePropsHTML(feature);
                }
                else {
                    var name = feature.properties.name || feature.properties.kind;
                    if (name) {
                        name = '<b>'+name+'</b>';
                        name += '<br>(click for details)';
                    }
                    name = '<span class="labelInner">' + name + '</span>';
                    info = name;
                }

                if (info) {
                    tooltip.setContent(info);
                }
            }
            layer.openTooltip(selection.leaflet_event.latlng);
        }
        else {
            layer.closeTooltip();
        }
    }

    function onClick(selection) {
        // Link to edit in Open Street Map on alt+click (opens popup window)
        if (key.alt) {
            var center = map.getCenter();
            var url = 'https://www.openstreetmap.org/edit?#map=' + map.getZoom() + '/' + center.lat + '/' + center.lng;
            window.open(url, '_blank');
            return;
        }

        if (scene.introspection) {
            return; // click doesn't show additional details when introspection is on
        }

        // Show feature details
        var feature = selection.feature;
        if (feature) {
            var info = getFeaturePropsHTML(feature);
            tooltip.setContent(info);
            layer.openTooltip(selection.leaflet_event.latlng);
        }
        else {
            layer.closeTooltip();
        }
    }

    // Get an HTML fragment with feature properties
    function getFeaturePropsHTML (feature) {
        var props = ['name', 'kind', 'kind_detail', 'id']; // show these properties first if available
        Object.keys(feature.properties) // show rest of proeprties alphabetized
            .sort()
            .forEach(function(p) {
                if (props.indexOf(p) === -1) {
                    props.push(p);
                }
            });

        var info = '<div class="featureTable">';
        props.forEach(function(p) {
            if (feature.properties[p]) {
                info += '<div class="featureRow"><div class="featureCell"><b>' + p + '</b></div>' +
                    '<div class="featureCell">' + feature.properties[p] + '</div></div>';
            }
        });
        info += '</div>';
        return info;
    }

    /*** Map ***/

    window.map = map;
    window.layer = layer;
    window.scene = layer.scene;

    window.addEventListener('load', function() {
        layer.addTo(map);
        layer.bringToFront();
    });
}());
