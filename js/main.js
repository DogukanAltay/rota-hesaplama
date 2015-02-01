(function() {

    var Locations = {
        data: [],
        $search: $('#content input'),
        $list: $('ul.list-group'),

        init: function() {
            $.ajax({
                url: 'yerler.php',
                dataType: 'json'
            })
                .done(function(result) {
                    result.forEach(function(location) {
                        Locations.data.push(location);
                    });
                });

            Locations.List.init();
        },

        // girdiye göre lokasyon filtreler
        filter: function(q) {
            return Locations.data.filter(function(obj) {
                return (obj.name.indexOf(q) > -1 && ! obj.selected);
            });
        }

    };

    Locations.List = {

        selectedMark: null,

        init: function() {
            Locations.$search
                .on('keyup', function(e) {
                    if (Locations.$search.data('val') != Locations.$search.val()) {
                        Locations.List.inputChange();
                    }

                    if (e.keyCode == 38 || e.keyCode == 40) {
                        Locations.List.handleKeyboardSelection(e);
                    }
                    else if (e.keyCode == 13) {
                        Locations.List.confirmSelection();
                    }

                    Locations.$search.data('val', Locations.$search.val());
                })
        },

        inputChange: function() {
            Locations.List.empty();
            Locations.List.search(Locations.$search.val());
        },

        // ekrandaki listeyi temizler
        empty: function() {
            Locations.$list.empty();
        },

        // filtrelenen sonuçları ekrana basar
        search: function(q) {
            if ( ! q.length) {
                Locations.List.unselect();
                return;
            }

            Locations.filter(q).forEach(function(item) {
                Locations.List.add(item);
            });

            Locations.List.select(0);
        },

        // klavyeyle yukarı aşağı lokasyon seçme kontrolü
        handleKeyboardSelection: function(e) {
            if (e.keyCode == 38) {
                Locations.List.selectPrev();
            }
            else if (e.keyCode == 40) {
                Locations.List.selectNext();
            }
        },

        // seçilen lokasyonu haritada sabitleme, onaylama
        confirmSelection: function() {
            Map.pinLocation({ 
                lat: this.selectedMark.position.lat(),
                lng: this.selectedMark.position.lng(),
                title: this.selectedMark.title
            })

            var toDelete = Locations.$list.children('.active');

            Locations.data.forEach(function(item) {
                item.selected = (item.id == toDelete.data('id'));
            });

            this.selectNext();

            toDelete.remove();
        },

        // index'teki lokasyonu seçip haritaya ekle
        select: function(index) {
            var $children = Locations.$list.children(),
                $select = $children.eq(index);

            Locations.List.unselect();

            $select.addClass('active');

            Locations.List.selectedMark = Map.mark($select.data());
        },

        selectNext: function() {
            var $children = Locations.$list.children(),
                $selected = $children.filter('.active');

            Locations.List.select(Math.min($children.size() - 1, $selected.index() + 1));
        },

        selectPrev: function() {
            var $children = Locations.$list.children(),
                $selected = $children.filter('.active');

            Locations.List.select(Math.max(0, $selected.index() - 1));
        },

        unselect: function() {
            Locations.$list.children().removeClass('active');

            if (Locations.List.selectedMark)
                Locations.List.selectedMark.setMap(null);
        },

        // ekrandaki listeye lokasyon ekler
        add: function(location) {
            Locations.$list.append(
                '<li class="list-group-item" data-id="{id}" data-lat="{lat}" data-lng="{lng}" data-title="{name}">{name}</li>'
                    .replace(/\{name\}/g, location.name)
                    .replace('{id}', location.id)
                    .replace('{lat}', location.lat)
                    .replace('{lng}', location.lng)
            );
        }

    };

    var Map = {
        map: null,

        init: function() {
            Map.map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: { lat: 38.417675, lng: 27.0797171 },
                zoom: 7
            });

            Locations.init();
        },

        mark: function(opts) {
            return new google.maps.Marker({
                position: new google.maps.LatLng(opts.lat, opts.lng),
                map: Map.map,
                title: opts.title
            })
        },

        pinLocation: function(location) {
            var mark = this.mark(location);

            google.maps.event.addListener(mark, 'rightclick', function() {
                mark.setMap(null);
            });
        }
    };

    window.Map = Map;

})();