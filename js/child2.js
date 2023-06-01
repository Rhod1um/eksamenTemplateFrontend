console.log("vi er i child2.js");
"use strict" //enabler nyere js, ES6 og opefter, du kan ikke bruge uerklærede variabler

const endpoint = "http://localhost:8080/child"
const endpointParent1 = "http://localhost:8080/parent1"
const endpointParent2 = "http://localhost:8080/parent2"
const ddParent1 = document.getElementById("parent1")
const ddParent2 = document.getElementById("parent2")


let fetchedList = []
let parent1List = []
let parent2List = []
let selectedId

window.addEventListener("load", initApp)

async function initApp() {
    console.log("app is running")
    await updateTable()
    await updateDropdown()

    document.querySelector("#btn-create").addEventListener("click", createClick)
    document.querySelector("#form-create .btn-cancel").addEventListener("click", createCancel)
    document.querySelector("#form-create").addEventListener("submit", createSubmit)
    document.querySelector("#form-update").addEventListener("submit", updateSubmit)
    document.querySelector("#form-update .btn-cancel").addEventListener("click", updateCancelClicked)
    document.querySelector("#form-delete .btn-cancel").addEventListener("click", deleteCancelClicked)
}
//create table, data fetched from db
async function updateTable(){
    document.querySelector("#table tbody").innerHTML = ""
    fetchedList = await get(endpoint)
    sortByName() //gøres før noget vises i tabel, så det altid er sorteret alfabetisk
    console.log(fetchedList)
    createTable(fetchedList)
}
async function updateDropdown(){
    document.querySelector("#parent1").innerHTML = ""
    document.querySelector("#parent2").innerHTML = ""

    parent1List = await get(endpointParent1)
    console.log(parent1List)
    parent2List = await get(endpointParent2)
    console.log(parent2List)

    createDropdownParent1(parent1List)
    createDropdownParent2(parent2List)
}
//fetched data som skal displayes i tabel
async function get(endpoint) {
    const response = await fetch(endpoint)
    const data = await response.json() //at omdanne til json returnere også en promise, derfor await først
    console.log(data)
    return data
}
//display tabelrækker og kolonner
function createTable(fetchedList) {
    for (const object of fetchedList) { //for of loop
        const html = `
        <tr>
            <td>${object.childId}</td>
            <td>${object.name}</td>
            <td>${object.parent1.name}</td> <!--hvis den siger cannot find name er det fordi der er oprettet child uden parent på-->
            <td>${object.parent2.name}</td>

            <td>
                <button class="btn-delete">Slet</button> <!--kopier "sikker på du vil slette" dialog fra tidligere sps-->
            </td>
            <td>
                <button class="btn-update">Rediger</button>
            </td>
        </tr>`
        document.querySelector("#table tbody").insertAdjacentHTML("beforeend", html)
        document.querySelector("#table tbody tr:last-child .btn-delete") //last-child skal være på ellers sletter den alle objekter
            .addEventListener("click", function(){
                console.log(object)
                showDeleteDialog(object)
            })
        document.querySelector("#table tbody tr:last-child .btn-update")
            .addEventListener("click", function(){
                showUpdateDialog(object)
            })
    }
}
function createDropdownParent1(parent1List){
    let html = "";

    for (const object of parent1List) {
        html += /*html*/ `<option value="${object.parent1Id}">${object.name}</option>`;
    }

    document.querySelector("#parent1").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-parent1").insertAdjacentHTML("beforeend", html);
}
function createDropdownParent2(parent2List){
    let html = "";

    for (const object of parent2List) {
        html += /*html*/ `<option value="${object.paren2Id}">${object.name}</option>`;
    }

    document.querySelector("#parent2").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-parent2").insertAdjacentHTML("beforeend", html);
}

//delete
async function deleteObject(id){
    console.log(id)
    const response = await fetch(`${endpoint}/${id}`, {method:"DELETE"})
    if (response.ok){
        updateTable()
    }
}
//update dialog popup med hentet data om objektet. det her gøres pga closuren, mens form-update-knap-eventlistener er i initApp
function showUpdateDialog(object){
    console.log(object) //her lægger vi ting i felterne
    selectedId = object.parent1Id //"gemmer" id på selected teacher når man trykker update
    const form = document.querySelector("#form-update")
    form.name.value = object.name

    document.querySelector("#dialog-update").showModal()
}
//send det nye for update, kaldes i initApp
function updateSubmit(event){
    event.preventDefault()
    const form = event.target
    const name = form.name.value
    console.log(name)
    update(selectedId, name)
    document.querySelector("#dialog-update").close()
}
//send PUT
async function update(parent1Id, name){
    const object = {parent1Id, name} //husk rigtig id navn når json objekt laves!! ellers 404
    const json = JSON.stringify(object)
    console.log(json)
    const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: json})

    if (response.ok){
        updateTable()
    }
}
//kaldes i initApp
function createSubmit(event){
    event.preventDefault()
    const form1 = event.currentTarget;

    const formData = new FormData(form1)
    create(formData)

    const form = event.target
    const name = form.name.value
    const parent1Id = form.parent1.value
    const parent2Id = form.parent2.value

    create(name, parent1Id, parent2Id)
}
//POST
async function create(name, parent1Id, parent2Id){
    document.querySelector("#dialog-create").close() //lukker dialog når man har submitted
    /*
    const plainFormData = Object.fromEntries(formData.entries())
    const ixactivity = ddParent1.selectedIndex;
    const linjeActivity = ddParent1[ixactivity]
    plainFormData.parent1 = linjeActivity.parent1

    const ixemployee = ddParent2.selectedIndex;
    const linjeEmployee = ddParent2[ixemployee]
    plainFormData.parent2 = linjeEmployee.parent2

    console.log("plainFormData: ", plainFormData)
    const formDataJsonString = JSON.stringify(plainFormData)
     */


    //console.log(name, parent1Id, parent2Id)

    let obj1 = parent1List[0]
    let obj2 = parent2List[0]

    const newObject = { //js objekt som skal laves til json
        name: name,
        parent1: obj1,
        parent2: obj2
    }
    console.log(newObject)
    const json = JSON.stringify(newObject) //laver js objekt til json
    console.log(json)

    let json1 = {"childId":2,"name":"child2","parent1":{"parent1Id":1,"name":"parent1_1"},"parent2":{"name":"parent2","paren2Id":2}}

    let h = `{"name":"ny","parent1":{"parent1Id":1,"name":"parent1_1"},"parent2":{"name":"parent2","paren2Id":2}}`

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: h})
    //til firebase behøver man ikke inkludere header
    console.log(response)
    if (response.ok) {
        //man skal manuelt refreshe siden for at de nye kommer frem og det er grimt i js, det må man ikke
        //så vi skal manuelt sætte nye linjer ind med de nye lærerer
        await updateTable()
    }
}
//sorter alfabetisk
function sortByName(){ //hvis vi ikke sortere så sorteres det på mærkelig måde af firebase
    fetchedList.sort((object1, object2) => object1.name.localeCompare(object2.name))

    //ikke arrow:
    //teachers.sort(teacher1, teacher2){
    //    return teacher1.name.localeCompare(teacher2.name)
    //}
}
function deleteCancelClicked() {
    document.querySelector("#dialog-delete").close(); // close dialog
}
function updateCancelClicked() {
    document.querySelector("#dialog-update").close(); // close dialog
}

function showDeleteDialog(object){
    // called when delete button is clicked
    selectedId = object.parent1Id //"gemmer" id på selected teacher når man trykker update
    //vis navn af person/ting som slettes
    document.querySelector("#dialog-delete-name").textContent = object.name
    // show delete dialog
    document.querySelector("#dialog-delete").showModal()

    document.querySelector("#form-delete").addEventListener("submit", function(){
        deleteObject(object.parent1Id)
    })
}
function createClick(){
    document.querySelector("#dialog-create").showModal()
}
function createCancel(){
    document.querySelector("#dialog-create").close()
}
