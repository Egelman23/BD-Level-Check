// ==UserScript==
// @name         bd level check
// @version      1.1.0
// @description  checks for non max bds
// @author       Miro
// @include      https://*.grepolis.com/game/*
// @grant        none
// @namespace https://greasyfork.org/users/984383
// @downloadURL https://update.greasyfork.org/scripts/502099/bd%20level%20check.user.js
// @updateURL https://update.greasyfork.org/scripts/502099/bd%20level%20check.meta.js
// ==/UserScript==

(async function() {

    // wait for page to load
    var sleep = (n) => new Promise((res) => setTimeout(res, n));
    await sleep(2000)

    const farmTownRelations = Object.values(MM.getModels().FarmTownPlayerRelation);
    const allTowns = Object.values(ITowns.getTowns());
    const associations = [];

    bd_check = {};

    
    var css = {'background': 'BurlyWood no-repeat scroll -2px -3px'};

    function add_button() {
        $('<div class="activity_wrap"><div class="activity check_bd"><div class="divider"></div></div></div>').insertAfter($('.toolbar_activities .middle .activity_wrap:last-child'));

        let btn = $('div .check_bd');

        btn.css(css);
        btn.on('click', bd_check.check_bd_max);
    }

    
    bd_check.check_bd_max = function() {
        associations.length = 0;
        for (const farmTownRelation of farmTownRelations) {
            const farmTownId = farmTownRelation.getFarmTownId();
            const farmTownLevel = farmTownRelation.attributes.expansion_stage;

            if (farmTownLevel < 6) {
                const farmTown = MM.getModels().FarmTown[farmTownId];
                if (farmTown) {
                    const [matchingTown] = allTowns.filter(t => t.getIslandCoordinateX() === farmTown.getIslandX() && t.getIslandCoordinateY() === farmTown.getIslandY());
                    if (matchingTown) associations.push({ townName: matchingTown.name, TownId: matchingTown.id, FarmTownId: farmTownId , FarmTownLevel:  farmTownLevel, islandX: farmTown.getIslandX(), islandY: farmTown.getIslandY() });
                }
            }
        }

        if (associations.length > 0) {
            let associations_html = '';
            for (const association of associations) {
                associations_html += "Boerendorp level: " + association.FarmTownLevel + " for  Town: <a href='#' class='gp_town_link' onclick='bd_check.jump_and_open_bd_window(" + association.TownId + "," +association.FarmTownId + ")'>" + association.townName + "</a><br>";
            }

            let bdWindow = GPWindowMgr.Create(GPWindowMgr.TYPE_DIALOG, "BDs not max level");
            bdWindow.setSize(600, 600);
            bdWindow.setPosition(['center, center']);
            bdWindow.setContent2(associations_html);
            bdWindow.getJQElement().find('div.gpwindow_content').css('overflow-y', 'scroll');

            
        } else {
            let bdWindow = GPWindowMgr.Create(GPWindowMgr.TYPE_DIALOG, "BDs level check");
            bdWindow.setSize(300, 100)
            bdWindow.setPosition(['center, center']);
            bdWindow.setContent2("All BDs are max level.");
        }
    }

    bd_check.jump_and_open_bd_window = function(town_id, farm_town_id) {
        WMap.mapJump(ITowns.getTown(town_id), true);
        HelperTown.townSwitch(town_id);
        FarmTownWindowFactory.openWindow(farm_town_id);
    }

    add_button();
})();