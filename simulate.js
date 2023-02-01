let ready = false

let app = {}

let savedApp = localStorage.getItem("app")
if(savedApp.length > 0) {
    app = JSON.parse(savedApp)
}

let obrig = []

let cachedJson
fetch("./components.json")
    .then(response => response.json())
    .then(json => {
        for(let period in json["periods"]) {
            for(let i in json["periods"][period]) {
                obrig.push(json["periods"][period][i])
            }
        }
        cachedJson = json
        if(ready) {
            let version = localStorage.getItem("version")
            let savedSimpleSelec = localStorage.getItem("simple_selec")
            let savedSelec = localStorage.getItem("selec")
            if(version === document.getElementById("guide").innerText && savedSimpleSelec !== null && savedSimpleSelec.length > 0 && savedSelec !== null && savedSelec.length > 0) {
                simple_selec = JSON.parse(savedSimpleSelec)
                selec = JSON.parse(savedSelec)
            }
            updateTable()
        }else{
            ready = true
        }
    });

let disc = {}    
fetch("./guia.html")
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const decoder = new TextDecoder("utf-8");
        const ui8array = new Uint8Array(buffer)
        const html = decoder.decode(ui8array)
        document.getElementById("guide").innerText = html.split("<font size=\"4\">")[1].replace("<br>", "");
        let str = ("<table" + html.split("<table")[1].split("</table>")[0] + "</table>")
        let div = document.createElement("div")
        div.innerHTML = str
        let table = div.firstChild
        let lastDisciplina = ""
        let lastTurma = ""
        for(let childId in table.firstChild.children) {
            let child = table.firstChild.children[childId]
            if(child.children && child.children.length == 6) {
                let disciplina = lastDisciplina
                let turma = lastTurma
                let vagas, dia, horario, docente
                for(let propId in child.children) {
                    let prop = child.children[propId]
                    if(propId == 0 && prop.innerText.length > 0) {
                        disciplina = prop.innerText
                    }else if(propId == 1 && prop.innerText.length > 0) {
                        turma = prop.innerText
                    }else if(propId == 2) {
                        vagas = prop.innerText
                    }else if(propId == 3) {
                        dia = prop.innerText
                    }else if(propId == 4) {
                        horario = prop.innerText
                    }else if(propId == 5) {
                        docente = prop.innerText
                    }
                }
                let split = disciplina.split(" - ")
                if(split.length == 2) {
                    let code = split[0]
                    let name = split[1]
                    if(disc[code] == undefined) {
                        disc[code] = {}
                        
                    }
                    if(disc[code][turma] == undefined) {
                        disc[code][turma] = {
                            "code": code,
                            "turma": turma,
                            "color": "hsl("+Math.floor(Math.random() * 361)+", 50%, 50%)",
                            "name": name,
                            "vagas": vagas,
                            "dia": [],
                            "horario": [],
                            "docente": []
                        }
                    }
                    disc[code][turma]["dia"].push(dia)
                    disc[code][turma]["horario"].push(horario)
                    if(disc[code][turma]["docente"].indexOf(docente) < 0) {
                        disc[code][turma]["docente"].push(docente)
                    }

                }
                lastDisciplina = disciplina
                lastTurma = turma
            }
        }
        if(ready) {
            let version = localStorage.getItem("version")
            let savedSimpleSelec = localStorage.getItem("simple_selec")
            let savedSelec = localStorage.getItem("selec")
            if(version === document.getElementById("guide").innerText && savedSimpleSelec.length > 0 && savedSelec.length > 0) {
                simple_selec = JSON.parse(savedSimpleSelec)
                selec = JSON.parse(savedSelec)
            }
            updateTable()
        }else{
            ready = true
        }
    })

let simple_selec = []
let selec = {
    "SEG": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    "TER": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    "QUA": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    "QUI": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    "SEX": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    "SAB": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
}

function updateElements() {
    let search = document.getElementById("search").value.toLowerCase()
    document.getElementById("classes").innerHTML = ""
    for(let code in disc) {
        let component = cachedJson["components"][code]
        let requirements
        if(component == undefined) {
            requirements = []
        }else{
            requirements = component["requirements"]
        }
        let hasRequirements = !app[code]
        if(requirements.length > 0) {
            for(let req in requirements) {
                if(!app[requirements[req]]) {
                    hasRequirements = false
                }
            }
        }
        if(hasRequirements) {
            for(let turma in disc[code]) {
                let dis = disc[code][turma]
                if(dis["dia"].indexOf("CMB") < 0 && (search.length <= 0 || (dis["name"].toLowerCase().indexOf(search) > -1 || dis["code"].toLowerCase().indexOf(search) > -1))) { 
                    let div = document.createElement("div")
                    div.classList.add("component")
                    div.classList.add("large")
                    let title = document.createElement("p")
                    title.innerText = code + " - " + dis["name"]
                    div.appendChild(title)
                    for(let d in dis["docente"]) {
                        let doc = document.createElement("a")
                        doc.innerText = dis["docente"][d]
                        div.appendChild(doc)
                    }
                    let type = document.createElement("p")
                    if(obrig.indexOf(code) >= 0) {
                        type.innerText = "Obrigatória"
                        type.classList.add("obrig")
                    }else{
                        type.innerText = "Optativa"
                        type.classList.add("optat")
                    }
                    div.appendChild(type)
                    let mirror = document.createElement("div")
                    mirror.classList.add("mirror")
                    let days = document.createElement("div")
                    days.classList.add("list")
                    for(let d in dis["dia"]) {
                        let a = document.createElement("a")
                        a.innerText = dis["dia"][d]
                        days.appendChild(a)
                    }
                    mirror.appendChild(days)
                    let hours = document.createElement("div")
                    hours.classList.add("list")
                    for(let h in dis["horario"]) {
                        let a = document.createElement("a")
                        a.classList.add("hour")
                        a.innerText = dis["horario"][h]
                        hours.append(a)
                    }
                    mirror.appendChild(hours)
                    let space1 = document.createElement("div")
                    space1.classList.add("space")
                    mirror.appendChild(space1)
                    let info = document.createElement("div")
                    info.classList.add("list")
                    let status = document.createElement("div")
                    status.classList.add("status")
                    let select = document.createElement("p")

                    if(canInsert(dis)) {
                        select.innerText = "Selecionar"
                        select.classList.add("aprov")
                        select.onclick = function() {
                            insert(dis)
                            updateTable()
                        }
                    }else if(isInserted(dis)) {
                        select.innerText = "Remover"
                        select.classList.add("reprov")
                        select.onclick = function() {
                            remove(dis)
                            updateTable()
                        }
                    }else{
                        select.innerText = "Substituir"
                        select.classList.add("subst")
                        select.onclick = function() {
                            let oldDis = getInserted(dis)
                            while(oldDis["code"] !== undefined) {
                                remove(oldDis)
                                oldDis = getInserted(dis)
                            }
                            insert(dis)
                            updateTable()
                        }
                    }
                    status.appendChild(select)
                    info.appendChild(status)
                    mirror.appendChild(info)
                    let space3 = document.createElement("div")
                    space3.classList.add("space")
                    mirror.appendChild(space3)
                    div.appendChild(mirror)
                    let space4 = document.createElement("div")
                    space4.classList.add("space")
                    div.appendChild(space4)
                    let vagas = document.createElement("p")
                    vagas.innerText = "Vagas: " + dis["vagas"]
                    div.appendChild(vagas)
                    document.getElementById("classes").appendChild(div)
                    disc[code][turma]["element"] = div
                }
            }
        }
    }
}

function updateTable() {
    localStorage.setItem("version", document.getElementById("guide").innerText)
    localStorage.setItem("simple_selec", JSON.stringify(simple_selec))
    localStorage.setItem("selec", JSON.stringify(selec))
    let tbody = document.getElementById("tbody")
    for(let tc in tbody.children) {
        let row = tbody.children[tc]
        if(tc > 0 && tc < 17) {
            for(let tr in row.children) {
                if(tr > 0 && tr < 7) {
                    let dia
                    if(tr == 1) dia = "SEG"
                    else if(tr == 2) dia = "TER"
                    else if(tr == 3) dia = "QUA"
                    else if(tr == 4) dia = "QUI"
                    else if(tr == 5) dia = "SEX"
                    else if(tr == 6) dia = "SAB"
                    let sel = selec[dia][tc-1]
                    if(sel["code"] !== undefined) {
                        let code = sel["code"]
                        let turma = sel["turma"]
                        let color = disc[code][turma]["color"]
                        let el = row.children[tr]
                        if(el.getElementsByTagName != undefined) {
                            el.style = "background-color: "+color
                            el.innerText = code
                        }
                    }else{
                        let el = row.children[tr]
                        if(el.getElementsByTagName != undefined) {
                            el.style = ""
                            el.innerText = ""
                        }
                    }
                }
            }
        }
    }
    updateElements()
}



function remove(dis) {
    let lastDia = ""
    for(let d in dis["dia"]) {
        let dia = lastDia
        if(dis["dia"][d] !== "") {
            dia = dis["dia"][d]
        }
        let hr = dis["horario"][d]
        let split = hr.split(" às ")
        let from = hourToIndex(split[0])
        let to = hourToIndex(split[1])
        for(let idx = from-1; idx < from+to-from-1; idx++) {
            selec[dia][idx] = {}
        }
        lastDia = dia
    }
    simple_selec.splice(simple_selec.indexOf(dis["code"]), 1)
}

function insert(dis) {
    let lastDia = ""
    for(let d in dis["dia"]) {
        let dia = lastDia
        if(dis["dia"][d] !== "") {
            dia = dis["dia"][d]
        }
        let hr = dis["horario"][d]
        let split = hr.split(" às ")
        let from = hourToIndex(split[0])
        let to = hourToIndex(split[1])
        for(let idx = from-1; idx < from+to-from-1; idx++) {
            selec[dia][idx] = {"code": dis["code"], "turma": dis["turma"]}
        }
        lastDia = dia
    }
    simple_selec.push(dis["code"])
}

function canInsert(dis) {
    if(simple_selec.indexOf(dis["code"]) >= 0) {
        return false
    }
    let lastDia = ""
    for(let d in dis["dia"]) {
        let dia = lastDia
        if(dis["dia"][d] !== "") {
            dia = dis["dia"][d]
        }
        let hr = dis["horario"][d]
        let split = hr.split(" às ")
        let from = hourToIndex(split[0])
        let to = hourToIndex(split[1])
        for(let idx = from-1; idx < from+to-from-1; idx++) {
            if(selec[dia][idx]["code"] !== undefined) {
                return false
            }
        }
        lastDia = dia
    }
    return true
}

function isInserted(dis) {
    let lastDia = ""
    for(let d in dis["dia"]) {
        let dia = lastDia
        if(dis["dia"][d] !== "") {
            dia = dis["dia"][d]
        }
        let hr = dis["horario"][d]
        let split = hr.split(" às ")
        let from = hourToIndex(split[0])
        let to = hourToIndex(split[1])
        for(let idx = from-1; idx < from+to-from-1; idx++) {
            if(selec[dia][idx]["code"] !== undefined) {
                if(selec[dia][idx]["code"] !== dis["code"] || selec[dia][idx]["turma"] !== dis["turma"] ) {
                    return false
                }
            }else{
                return false
            }
        }
        lastDia = dia
    }
    return true
}

function getInserted(dis) {
    if(simple_selec.indexOf(dis["code"]) >= 0) {
        let selecDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"]
        for(let d in selecDays) {
            let day = selec[selecDays[d]]
            for(let h in day) {
                if(selec[selecDays[d]][h]["code"] === dis["code"]) {
                    return disc[selec[selecDays[d]][h]["code"]][selec[selecDays[d]][h]["turma"]]
                }
            }
        }
    }else{
        let lastDia = ""
        for(let d in dis["dia"]) {
            let dia = lastDia
            if(dis["dia"][d] !== "") {
                dia = dis["dia"][d]
            }
            let hr = dis["horario"][d]
            let split = hr.split(" às ")
            let from = hourToIndex(split[0])
            let to = hourToIndex(split[1])
            for(let idx = from-1; idx < from+to-from-1; idx++) {
                if(selec[dia][idx]["code"] !== undefined) {
                    return disc[selec[dia][idx]["code"]][selec[dia][idx]["turma"]]
                }
            }
            lastDia = dia
        }
        return {}
    }
}

function hourToIndex(hour) {
    if(hour === "07:00") return 0
    else if(hour === "07:55") return 1
    else if(hour === "08:50") return 2
    else if(hour === "09:45") return 3
    else if(hour === "10:40") return 4
    else if(hour === "11:35") return 5
    else if(hour === "12:30" || hour === "13:00") return 6
    else if(hour === "13:55") return 7
    else if(hour === "14:50") return 8
    else if(hour === "15:45") return 9
    else if(hour === "16:40") return 10
    else if(hour === "17:35") return 11
    else if(hour === "18:30") return 12
    else if(hour === "19:25") return 13
    else if(hour === "20:20") return 14
    else if(hour === "21:15") return 15
    else return 16
}

function reset() {
    simple_selec = []
    selec = {
        "SEG": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        "TER": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        "QUA": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        "QUI": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        "SEX": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        "SAB": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    }
    updateTable()
}