//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum =  sum + current.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var ID;
            var newItem;

            //Create a new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else{
                ID = 0;
            }

            //Create new item based on type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //pushing the new item in data structure
            data.allItems[type].push(newItem);

            //returning the new item
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            //makes the array of all the ids
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }




        },

        calculateBudget: function(){
            //calulate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget and percentage used
            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                }else{
                    data.percentage = -1;
                }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    };

})();



//UI CONTROLLER
var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function(num, type){
            var int,dec, numSplit;

            //2310 -> + 2,310
            //25102 -> - 25,102

            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];

            if(int.length > 3){
                int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
            }

            return (type === 'exp' ? '-': '+') + int + '.' +dec;

        };

    //selfmade foreach function for nodelists as it is not available
    var nodeListForEach = function(nodeList, callback){
        for(var i=0; i<nodeList.length; i++){
            callback(nodeList[i],i);
        }
    };



    //get input field data
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value, //will give inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function(obj, type){
            var html, newHTML;

            //Creating new HTML placeholder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replacing the placeholders with actual data
            newHTML = html.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.description);
            newHTML = newHTML.replace('%value%',formatNumber(obj.value, type));

            //Inserting the HTML in DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            //it returns a list
            fields = document.querySelectorAll(DOMStrings.inputDescription+ ',' + DOMStrings.inputValue);

            //converting list to array
            fieldsArr = Array.prototype.slice.call(fields);

            fields.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expPerLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                   current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },

        displayMonth : function(){
            var now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },


        changedType: function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            nodeListForEach(fields,function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },


        getDOMStrings : function(){
            return DOMStrings;
        }
    }

})();



//GLOBAL APP CONTROLLER
var controller = (function(bdgtCtrl, UICtrl){

    DOMStrings = UICtrl.getDOMStrings();
    var setupEventListeners = function(){
        document.querySelector(DOMStrings.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13){
            ctrlAddItem();
        }
    });
        document.querySelector(DOMStrings.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOMStrings.inputType).addEventListener('change', UICtrl.changedType);
    }


    var updateBudget = function(){

        //1. calculating the budget
        bdgtCtrl.calculateBudget();

        //2. return the budget
        var budget = bdgtCtrl.getBudget();

        //3. displaying the budget on UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        // 1. calculate percentages
        bdgtCtrl.calculatePercentages();

        // 2. read the percentages from budget controller
        var percentages = bdgtCtrl.getPercentages();

        // 3. update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function(){

        var input, newItem;

        //1. Getting the input field data from form
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value >0){

            //2. adding the item to budget controller data structure
            newItem = bdgtCtrl.addItem(input.type, input.description, input.value);

            //3. adding item to UI
            UICtrl.addListItem(newItem,input.type);

            //4. clearing the input fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
    }
};

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            bdgtCtrl.deleteItem(type, ID);

            // 2. delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();

        }
    };


    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            setupEventListeners();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController,UIController);

controller.init();