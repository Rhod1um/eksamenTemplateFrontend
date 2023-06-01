window.addEventListener("DOMContentLoaded", addNavBar)

async function addNavBar() {
    const response = await fetch("/../fragments/navbar.html");
    const html = await response.text();
    document.body.insertAdjacentHTML("beforebegin", html);
}