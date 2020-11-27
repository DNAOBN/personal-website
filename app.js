const name = document.getElementById("aqui");

console.log(document.querySelectorAll("daniel path"))
console.log(document.getElementsByTagName("path"))
console.log(name);
for (let i = 0; i < name.length; i++) {
  console.log(`letter ${i} is ${name[i].getTotalLength()}`)
}