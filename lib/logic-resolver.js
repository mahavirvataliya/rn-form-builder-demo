export default class LoginResolver {

  checkCondition(value, operator, expected_value){
  
    //for checkboxes
    if(expected_value instanceof Array){
      let conditions = false;
      expected_value.forEach((item) => {
        let val = this.checkCondition(value, operator, item);
        if(val){
          conditions = true;
        }
      });
      return conditions;
    }else{
      switch(operator){
        case "==": 
          return (expected_value != null && value == expected_value.id);
        default: 
          return (expected_value != null && value != expected_value.id);
      }
    }
  }

  getField(name){
    let selectedField = null;
    this.currentForm.forEach((field) => {
      if (field.name == name) {
        selectedField = field;
      }
    });
    return selectedField;
  }

  getFieldsToHide(formValues, logics, currentForm) {

    this.formValues = formValues;
    this.currentForm = currentForm;
    let fieldsToHide = [];
    
    
    logics.forEach((logic) => {
      if (logic['status']) {
        
        const decisions = this.checkRules(logic['rules']);

        if (logic['allorany'] == "all" && decisions.indexOf(0) != -1) {
          fieldsToHide.push(logic['key']);
        }
    
        if (logic['allorany'] == "any" && decisions.indexOf(1) == -1) {
          fieldsToHide.push(logic['key']);
        }
      }
    });

    return fieldsToHide;
  }

  checkRules(rules){
    let decisions = [];
    rules.forEach(rule => {

      Object.keys(this.formValues).forEach((name) => {

        let field = this.getField(name);

        if (field && field['key'] == rule['field']) {
          let value = this.formValues[name];
          if (this.checkCondition(rule["value"], rule["operator"], value)) {
            decisions.push(1);
          } else {
            decisions.push(0);
          }
        }

      })
    });

    return decisions;
  }
}