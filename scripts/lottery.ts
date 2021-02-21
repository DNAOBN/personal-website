$(document).ready(main)
let selectedNumbers: number[] = [];
let lotteryResults: Result[] = [];

class Result {
  id: number;
  city: string;
  date: string;
  numbers: number[];
}

function main() {
  createGrid($('.lottery-grid'), 60);
}

function createGrid(element, number: number) {
  for (let i = 1; i <= number; i++) {
    element.append(`
      <input
        type="checkbox"
        id="${i}"
        onclick="toggleSelected(${i})"
      >
    `);
  };
}

function toggleSelected(number: number) {
  if (selectedNumbers.includes(number)) {
    selectedNumbers = selectedNumbers.filter(num => num !== number);
    document.getElementById("chosen-numbers").innerHTML = `Selecionados: ${selectedNumbers.sort((a, b) => a - b).join(' - ')}`
  } else if (selectedNumbers.length < 6) {
    selectedNumbers.push(number);
    document.getElementById("chosen-numbers").innerHTML = `Selecionados: ${selectedNumbers.sort((a, b) => a - b).join(' - ')}`
  } else {
    document.getElementById(number).checked = false;
  }

  $('#check-button').prop('disabled', selectedNumbers.length !== 6)
}

function checkSequence(sequence) {
  const resultString = lotteryResults.filter(result => 
    result.numbers.reduce((acc, value) => acc + (sequence.includes(value) ? 1 : 0), 0) > 3
  ).map(result => getResultString(result)).join('');
  setShownResults(resultString);
}

function loadResults() {
  const http = new XMLHttpRequest();
  http.onreadystatechange = () => {
    if (http.readyState === 4 && http.status === 200) {
      lotteryResults = parseCSVtoJSON(http.responseText);
      setShownResults(lotteryResults.map(result => getResultString(result)).join(''));
    }
  };
  http.open('GET', '../assets/resultados_mega.csv')
  http.send()
}

function getResultString({city, date, numbers}: Result) {
  const cityString = city ? ` em ${city}` : ''
  const dateString = date ? ` no dia ${date}` : ''
  return `<li>${numbers.map(num => `${num}`.padStart(2, '0')).join('-')}${cityString}${dateString}</li>`
}

function setShownResults(results) {
  document.getElementById("results").innerHTML = results;
}

function parseCSVtoJSON(resultsCSV: string): Result[] {
  return resultsCSV.split('\n').map(resultString => {
    const [
      id,
      city,
      date,
      ...numbers
    ] = resultString.replace(/"(.*),(.*)"/, `$1 -$2`).split(',');
    
    return {
      id: +id,
      city: city.toUpperCase(),
      date,
      numbers: numbers.map(num => +num)
    }
  });
}