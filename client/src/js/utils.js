'use strict';

function verify_code_unicity(myListe, myObject){
    return myListe.filter(
        function verify(element){
            return element.code===myObject.code && element.id!==myObject.id;
        }
    ).length;
}

function find_entity_index(myListe, myObject){
    var indexreturned = -1;
    myListe.forEach(
        function find(element, index){
            if(element.code===myObject.code){
                indexreturned = index;
            }
        }
    );
    return indexreturned;
}