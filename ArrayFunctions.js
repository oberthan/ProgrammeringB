const mineTal = [10, 30, 20, 40, 100];

console.log(`1. ${mineTal.includes(30)}.\n\n`);

let index30 = mineTal.indexOf(30);
mineTal[index30]=69;
console.log(`2. Index of 30: ${index30}\nPutting 69 in its place: ${mineTal}.\n\n`);

let firstO20 = mineTal.find(v => {return v>20;});
console.log(`3. The first number over 20 is ${firstO20}.\n\n`);

let nyArrayFilter = mineTal.filter(n => {return n<100;});
console.log(`4. The new filtered array looks like this: ${nyArrayFilter}.\n\n`);

let nyArrayMap = mineTal.map(v => {return v*2;});
console.log(`5. The new mapped array looks like this: ${nyArrayMap}.\n\n`);

mineTal.sort((a, b) => a - b);
console.log(`6. The sorted array looks like this: ${mineTal}.\n\n`);

let produkt = mineTal.reduce((acc, number) => {return acc * number;});
let summen = mineTal.reduce((acc, number) => {return acc + number;});
console.log(`7. The product of the array is: ${produkt}, and the sum is:${summen}.\n\n`);

