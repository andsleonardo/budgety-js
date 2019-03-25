var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0)
      this.percentage = Math.round((this.value / totalIncome) * 100);
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    items: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.items[type].forEach(function(el) { sum += el.value; });
    data.totals[type] = sum;
  };

  return {
    addItem: function(type, description, value) {
      var newItem, id;

      // Create new ID
      if (data.items[type].length === 0) id = 1;
      else id = data.items[type][data.items[type].length - 1].id + 1;

      // Create new item based on type and add it to respective data array
      if (type === 'exp') newItem = new Expense(id, description, value);
      if (type === 'inc') newItem = new Income(id, description, value);

      data.items[type].push(newItem);

      return newItem;
    },

    deleteItem: function(id, type) {
      var ids, index;

      ids = data.items[type].map(function(current) { return current.id; });
      index = ids.indexOf(parseInt(id));

      if (index !== -1) data.items[type].splice(index, 1);
    },

    calculateBudget: function() {
      calculateTotal('inc');
      calculateTotal('exp');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0)
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    },

    calculatePercentages: function() {
      data.items.exp.forEach(function(exp) {
        exp.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      return data.items.exp.map(function(exp) {
        return exp.getPercentage();
      });
    },

    getBudget: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp
      };
    },

    data: function() {
      console.log(data);
    },
  };

})();

var UIController = (function() {
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomesList: '.income__list',
    expensesList: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    itemPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, sign;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3)
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

    sign = type === 'exp' ? '-' : '+';

    return sign + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++)
      callback(list[i], i);
  };

  return {
    getDOMStrings: function() { return DOMStrings; },

    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHTML, el;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        el = DOMStrings.incomesList;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        el = DOMStrings.expensesList;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder with actual data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      // Insert HTML into the DOM
      document.querySelector(el).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function(selectorId) {
      var item;

      item = document.getElementById(selectorId);
      item.parentNode.removeChild(item);
    },

    clearFields: function() {
      var $fields, fields;

      $fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
      fields = Array.prototype.slice.call($fields);

      fields.forEach(function(el) { el.value = ''; });
      fields[0].focus();
    },

    displayBudget: function(obj) {
      var type;

      type = obj.budget < 0 ? 'exp' : 'inc';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

      if (obj.percentage > 0)
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      else
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.itemPercentageLabel);
      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++)
          callback(list[i], i);
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + '%';
        else
          current.textContent = '---';
      });
    },

    displayMonth: function() {
      var now, months, month, year;

      now = new Date();
      year = now.getFullYear();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
          DOMStrings.inputDescription + ',' +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputButton).classList.toggle('red');
    }
  };
})();

var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();

    // Add item to expense or income clicking the appropriate button
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    // Add item to expense or income pressing down Enter
    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    // Make x button to respond to item deletion
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      updateBudget();
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(e) {
    var itemId, splitId;

    itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split('-');

      budgetCtrl.deleteItem(splitId[1], splitId[0]);
      UICtrl.deleteListItem(itemId);

      updateBudget();
      updatePercentages();
    }
  };

  var updateBudget = function() {
    var budget;

    budgetCtrl.calculateBudget();
    budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
  };

  return {
    init: function() {
      UICtrl.displayMonth();
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();
