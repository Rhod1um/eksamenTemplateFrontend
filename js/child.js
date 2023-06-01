console.log("vi er i child.js");
"use strict" //enabler nyere js, ES6 og opefter, du kan ikke bruge uerklærede variabler

const endpoint = "http://localhost:8080/child"
const endpointDropdown1 = "http://localhost:8080/parent1"
const endpointDropdown2 = "http://localhost:8080/parent2"
let fetchedList = []
let fetchedListDropDown1 = []
let fetchedListDropDown2 = []

let selectedId

window.addEventListener("load", initApp)

async function initApp() {
    console.log("app is running")
    await updateTable()

    fetchedListDropDown1 = await getDropDown1()
    fetchedListDropDown2 = await getDropDown2()

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
    fetchedList = await get()
    sortByName() //gøres før noget vises i tabel, så det altid er sorteret alfabetisk
    console.log(fetchedList)
    createTable(fetchedList)
}
//fetched data som skal displayes i tabel
async function get() {
    const response = await fetch(endpoint)
    const data = await response.json() //at omdanne til json returnere også en promise, derfor await først
    console.log(data)
    //firebase specifikt: json objekter ligger i et json objekt frem for array, det er lidt åndssvagt
    //derfor skal vi her have en ekstra funktion som omdanner det til en array. Skal ikke være i eksamensprojektet
    return data //returneres og lægges i fetchedList
    //i vores skal fetched liste bare returneres direkte
}
//display tabelrækker og kolonner
function createTable(fetchedList) {
    for (const object of fetchedList) { //for of loop
        const html = `
        <tr>
            <td>${object.childId}</td>
            <td>${object.name}</td>
            <td>${object.parent1.name}</td>
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
    selectedId = object.childId //"gemmer" id på selected teacher når man trykker update
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

    const form = event.target
    const name = form.name.value
    const parent1 = form.parent1.value //parent1 er select'en og dens value er hvad
    const parent2 = form.parent2.value

    //const teacher = teachers.find(teacher => teacher.id === teacherId);

    create(name, parent1, parent2)
}
//POST
async function create(name, parent1, parent2){
    document.querySelector("#dialog-create").close() //lukker dialog når man har submitted

    console.log(name, parent1, parent2)

    //const object1 = getObjectDropdown1(parent1)
    //const object2 = getObjectDropdown1(parent2)

    //const object1 = fetchedListDropDown1.find(object1 => object1.parent1Id === parent1);
    let index = -1
    for (let i = 0; i < fetchedListDropDown1.length; i++) {
        if (fetchedListDropDown1[i].parent1Id === parent1) {
            index = i;
            break
        }
    }
    console.log(index)
    console.log(fetchedListDropDown1[index])
    index = -1
    for (let i = 0; i < fetchedListDropDown2.length; i++) {
        if (fetchedListDropDown2[i].parent1Id === parent2) {
            index = i;
            break
        }
    }
    console.log(index)
    console.log(fetchedListDropDown2[index])

    const newObject = { //js objekt som skal laves til json
        name: name,
        parent1: fetchedListDropDown1[index],
        parent2: fetchedListDropDown2[index]
    }
    console.log(newObject)
    const json = JSON.stringify(newObject) //laver js objekt til json
    console.log(json)

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: json})
    //til firebase behøver man ikke inkludere header
    console.log(response)
    if (response.ok) {
        //man skal manuelt refreshe siden for at de nye kommer frem og det er grimt i js, det må man ikke
        //så vi skal manuelt sætte nye linjer ind med de nye lærerer
        await updateTable()
    }
}
function getObjectDropdown1(parent1){
    let index = -1
    for (let i = 0; i < fetchedListDropDown1.length; i++) {
        if (fetchedListDropDown1[i].parent1Id === parent1) {
            index = i;
            break
        }
    }
    console.log(index)
    console.log(fetchedListDropDown1[index])
    return fetchedListDropDown1[index]
}
function getObjectDropdown2(parent2){
    let index = -1
    for (let i = 0; i < fetchedListDropDown2.length; i++) {
        if (fetchedListDropDown2[i].parent1Id === parent2) {
            index = i;
            break
        }
    }
    console.log(index)
    console.log(fetchedListDropDown2[index])
    return fetchedListDropDown2[index]
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
    document.querySelector("#parent1").innerHTML=""
    document.querySelector("#parent2").innerHTML=""
    fillDropDown1()
    fillDropDown2()
}
function createCancel(){
    document.querySelector("#dialog-create").close()
}

//dropdown funktioner
async function getDropDown1() {
    const response = await fetch(endpointDropdown1)
    return await response.json()
}
async function getDropDown2() {
    const response = await fetch(endpointDropdown2)
    return await response.json()
}

function fillDropDown1(){
    console.log(fetchedListDropDown1)
    let html = "";

    for (const object of fetchedListDropDown1) {
        html += /*html*/ `<option value="${object.parent1Id}">${object.name}</option>`;
    }

    document.querySelector("#parent1").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-parent1").insertAdjacentHTML("beforeend", html);
}
function fillDropDown2(){
    let html = "";

    for (const object of fetchedListDropDown2) {
        html += /*html*/ `<option value="${object.paren2Id}">${object.name}</option>`;
    }

    document.querySelector("#parent2").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-parent2").insertAdjacentHTML("beforeend", html);
}