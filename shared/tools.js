async function delay (milliseconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, milliseconds);
    });
}


function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function randItemsFromArray (arr) {
    const mixed = [...arr];
    for (let i = 0; i < arr.length; i++) {
        const index1 = rand(0, arr.length - 1);
        const index2 = rand(0, arr.length - 1);

        const temp = mixed[index1];
        mixed[index1] = mixed[index2];
        mixed[index2] = temp;
    }
    return mixed.slice(0, rand(1, arr.length));
}





module["exports"].delay = delay;
module["exports"].rand = rand;
module["exports"].randItemsFromArray = randItemsFromArray;