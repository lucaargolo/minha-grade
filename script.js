let cachedJson
let app = {}

//Loads the components.json file
fetch("components.json")
    .then(response => response.json())
    .then(json => {
        let obligatory = {}
        //Checks what periods are configured and generates the period's components
        for(let name in json["periods"]) {
            let newDiv = document.createElement("div")
            newDiv.className = "period"
            let title = document.createElement("p")
            title.innerHTML = name
            newDiv.appendChild(title)
            for(let component in json["periods"][name]) {
                obligatory[json["periods"][name][component]] = true
                let newDiv2 = document.createElement("div")
                newDiv2.className = "component"
                newDiv2.id = json["periods"][name][component]
                newDiv2.innerHTML = "<p>"+json["periods"][name][component]+"</p><a>"+json["components"][json["periods"][name][component]]["name"]+"</a><div class=\"status\"></div>"
                newDiv.appendChild(newDiv2)
            }
            document.getElementById("obligatory").appendChild(newDiv)
        }
        //If the periods are already generated but there are still ungenerated components generates them as optative components
        for(let name in json["components"]) {
            if(!obligatory[name]) {
                let newDiv = document.createElement("div")
                newDiv.className = "component"
                newDiv.id = name
                newDiv.innerHTML = "<p>"+name+"</p><a>"+json["components"][name]["name"]+"</a><div class=\"status\"></div>"
                document.getElementById("optative").appendChild(newDiv)
            } 
        }
        //Saves the json in a cached variable so we dont need to fetch it every update
        cachedJson = json
        updateElements()
    });

//Resets the user actions
function reset() {
    app = {}
    updateElements()
}

//Sleeps
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Updates the elements
function updateElements() {  
    //For each component in the app variable, if the component is marked as true check if all its pre-requisites are also true.
    //If there is a pre-requisites marked as false, mark the component as false and update the elemens
    for(let a in app) {
        if(app[a]) {
            for(b in cachedJson["components"][a]["requirements"]) {
                if(!app[cachedJson["components"][a]["requirements"][b]]) {
                    app[a] = false;
                    updateElements()
                    return
                }
            }
        }
    }

    //For each component in the document body
    [].forEach.call(document.getElementsByClassName("component"), function(div) {
        //Check if all the pre-requisites are true, and if so mark the component as available
        let available = true
        for(let req in cachedJson["components"][div.id]["requirements"]) {
            if(!app[cachedJson["components"][div.id]["requirements"][req]]) {
                available = false
                break
            }
        }
        //Resets the status inner html
        div.getElementsByClassName("status")[0].innerHTML = ""
        if(available) {
            //If the component is available render two buttons, one for passing and another one for reproving in the discipline
            div.style = ""
            let aprovBtn = document.createElement("p")
            aprovBtn.innerText = "PASSEI"
            aprovBtn.classList.add("aprov")
            aprovBtn.onclick = function() {
                //If the user clicks in the "Im approved" button, marks the component as a true in the app var and update the elements
                app[div.id] = true
                updateElements()
            }
            let reprovBtn = document.createElement("p")
            reprovBtn.innerText = "PERDI"
            reprovBtn.classList.add("reprov")
            reprovBtn.onclick = function() {
                //If the user clicks in the "Im repproved" button, marks the component as a false in the app var and update the elements
                app[div.id] = false
                updateElements()
            }
            div.getElementsByClassName("status")[0].appendChild(aprovBtn)
            div.getElementsByClassName("status")[0].appendChild(reprovBtn)
        }else{
            //If the component is not available render the pre-requisites missing for it to be availavle
            div.style = "background-color: #802525"
            for(r in cachedJson["components"][div.id]["requirements"]) {
                let req = cachedJson["components"][div.id]["requirements"][r]
                if(!app[req]) {
                    let p = document.createElement("p")
                    p.innerText = req
                    p.onclick = async function() {
                        let e = document.getElementById(req)
                        e.scrollIntoView({block: "center"})
                        e.style = "background-color: #FFFFFF; color: black"
                        await sleep(500)
                        updateElements()
                    }
                    div.getElementsByClassName("status")[0].appendChild(p)
                }
            }
        }
        if(app[div.id]) div.style = "background-color: #256025"

    })
}