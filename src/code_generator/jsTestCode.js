function Animal() {
}
Animal.prototype.speak = function() {
        return console.log(0);
};
function Cat() {
        Animal.call(this);
}
Cat.prototype = Object.create(Animal.prototype);
Cat.prototype.constructor = Cat;
Cat.prototype.speak = function() {
        return console.log(1);
};
function Dog() {
        Animal.call(this);
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
        return console.log(2);
};
let cat; // Animal
let dog; // Animal
cat = new Cat();
dog = new Dog();
cat.speak();
dog.speak();

