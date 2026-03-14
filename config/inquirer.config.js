const inquirer = require('inquirer');
 require('colors')

 const inquirerMenu=async()=>{
    const answers=[
        {type:"list",//Ni idea aún tengo que leer documentación
            name: "opt",//variable con la cual se selecciona el valor
            message: `\n \n${"Bienvenido a la consola de administración. Por favor, elija una opción\n".green}`//Pregunta
            ,choices:[//Arreglo con la lista de opciones
                {
                    name:`${"1.".green} Crear SuperUsuario`,
                    value:1
                },
                {
                    name:`${"2.".green} Crear Usuario de prueba`,
                    value:2
                },
                {
                    name:`${"0.".green} Salir`,
                    value:0
                },
            ]
        }
     ]
   const {opt}=await inquirer.prompt(answers);
    return opt;
 }
 const pause=async()=>{
    const choices=[
        {
            type:"input",
            name:"pause",
            message:`Presione ${"ENTER".red} para continuar`
        }
    ]
   await inquirer.prompt(choices);
 }
   const inquirerReader=async(message)=>{
     answers=[
         {
             type:"input",
             message,
             name:"description",
             validate(description){
                 if(description.length===0) throw "La descripción no puede estar vacía";
                 return true;
             }

        }
     ]
     return (await inquirer.prompt(answers)).description;

  }
//  const inquirerDeleteMenu= async(tareas)=>{
//     const choices=tareas.map((task,index)=>{
// return{
//                name:`${(++index + ".").green}${task.description}`,
//                value:task.id}
//     })
//     choices.unshift({
//         name:`${"0.".green}Cancelar`
//         ,value:0
//     })
//     const answers=[
//         {
//             name:"id",
//             message:"Seleccione la tarea a eliminar",
//             type:"list",
//            choices
//         }

//     ]
//     return (await inquirer.prompt(answers)).id
//  }
 const inquirerConfirm=async(message)=>{
    answers=[{
        name:"confirmation",
        type:"confirm",
        message
    }]
    return (await inquirer.prompt(answers)).confirmation
 }
 const inquirerSelectItemsMenu= async(tareas)=>{
    const choices=tareas.map((task,index)=>{
return{
               name:`${(++index + ".").green}${task.description}`,
               value:task.id,
               checked:(task.completeDate)?true:false
            }
    })

    const answers=[
        {
            name:"idTasks",
            message:"Seleccione las tareas que desea completar",
            type:"checkbox",
           choices
        }

    ]
    const{idTasks}= (await inquirer.prompt(answers))
     return idTasks
 }
 module.exports={
    inquirerMenu,
    pause,
    inquirerReader,
    // inquirerDeleteMenu,
    inquirerConfirm,
    inquirerSelectItemsMenu
}