'use strict';

angular.module('confman')
    .factory('TableService', function TableService() {
        return {
            /**
             * Determination du numero de page max en fonction du nb d'enreg
             * et du nb affiche par page
             * @param total
             * @param nbparpage
             */
            getNumMaxPage: function (total, nbparpage) {
                if (total && nbparpage > 0) {
                    var numMaxPage = parseInt(total / nbparpage);

                    //On regarde si le nb passe est un multiple de NbMax
                    if (total % nbparpage === 0) {
                        return numMaxPage;
                    }
                    return numMaxPage + 1;
                }
                return 0;
            },

            /**
             * Cette méthode permet de construite la liste des numéros de page qui sera affichée sur l'écran. Cette liste
             * est construite à partir de la page en cours. On affiche toujours 10 pages. Pour la page en cours on affiche
             * les 5 précédents et les 4 suivants si le nombre est
             * @param page
             * @param numMaxPage
             */
            getPageSelector: function (page, numMaxPage) {
                var debut = 1, fin = numMaxPage, nbPageAffichee = numMaxPage;
                //On a un traitement particluier si la page en cours est plus grande que 6 pour limiter le nb affiche
                if (page > 6 && numMaxPage >= 10) {
                    nbPageAffichee = 10;
                    //On regarde si on a 4 pages après
                    if (numMaxPage - page >= 4) {
                        debut = page - 5;
                        fin = page + 4;
                    } else {
                        //Sinon on se contente de celle présente
                        debut = numMaxPage - 9;
                    }
                }
                //Construction de la liste retournee en limitant à 10
                var tab = [];
                for (var i = debut, c = 0; i <= fin && c < 10; i++, c++) {
                    tab.push(i);
                }
                return tab;
            }
        };
    });
