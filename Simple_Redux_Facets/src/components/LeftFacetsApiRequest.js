import React from 'react';
import axios from 'axios';

export default class LeftFacetsApiRequest extends Component{
    constructor(props){
        super(props);
        state = {
            baseURL: props.baseURL,
            START_POINT_URL_TO_SEARCH: props.UrlToSearch
        };
    }

    //Single Responsability Only Search Main URL
    searchCriteria(url_search) {
        return axios.get(url_search, {
            method: 'get',
        }).then(function (response) {
            if (response.data) {
                //Only filtered What I am going to need in this action
                return response.data;
            }
        }).catch(function (error) {
            console.log(error)
        });
    }

    //single Responsability to Search the Icon/Image
    getSvgIconDetail(typeIcon) {
        return self.instaceAxios.get('/Assets/Images/Map/Markers/' + typeIcon + '.svg', { //'/Map/icon/'
            method: 'get',
        }).then(function (response) {
            return ({ Type: typeIcon, SvgIcon: response });
            //return response.data.pipe(new FileWriter(typeIcon + '.jpg'))
        }).catch(function (error) {
            console.log(error);
            return ({ Type: typeIcon, SvgIcon: 'Img Not found!'});
        });
    }

    LoadFacets(urtToSearch) {
        console.log(urtToSearch);

        var responseMainSearch = self.searchCriteria(self.START_POINT_URL_TO_SEARCH);

        self.AllSearchDataResult = [];
        responseMainSearch.then(function (response) {
            //console.log("Must be 'Resolved'", responseMainSearch);
            self.AllSearchDataResult = response;

            var facetsUnique = self.AllSearchDataResult.map(function (facet) {
                return facet.Type;  // Just Returns the Values
            }).filter(function (item, index, arr) {
                return arr.indexOf(item) >= index;  //Type of Markers Without Repetition
            })

            console.log('facetsUnique:', facetsUnique);
            //create  new Array to Make Request Per Ico/Image
            var facetssArray = [({ subarr: facetsUnique })];

            //To solve Each without break
            Promise.all(facetssArray.map(function (entity) {
                return Promise.all(entity.subarr.map(function (item) {
                    return self.getSvgIconDetail(item);
                }));

            })).then(function (data) {
                console.log(data);
                self.loadRenderFacets(self.AllSearchDataResult, data.pop());
            });

        });
    }

    loadRenderFacets(allSearchData, allFacetsSvg) {
        console.log("AllSearchDataResult: ", allSearchData);
        console.log("AllFacetsIconImgSvg: ", allFacetsSvg);
        var leftFacets = document.getElementById('leftFacets');
        var htmlControls = "<ul  style='list-style: none;'>\n";
        allFacetsSvg.map(function (item) {
            htmlControls += "<li>\n" +
                "<label class='switch'>\n" +
                "<input type='checkbox' value='" + item.Type + "'/>" + item.Type + "\n" +
                "<span class='slider round'></span>\n" +
                "</label>\n" +
                "<li>\n";
        });
        htmlControls += "</ul>\n";
        leftFacets.innerHTML = htmlControls;

    }

render(){
    return (
        <div>Ola</div>

    );
    }

}

