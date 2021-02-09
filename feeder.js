const ViGEmClient = require('vigemclient');

// Tutorial to use the feeder
// to initiate the feeder, we can use :
// let feeder = new feeder("x360", function(){//Do Something}) 
// to change the values, we can use :
// feeder.setButtonValue("X", true)
// feeder.setAxisValue("leftAnalog", x)
// feeder.toggleButton("X")

class feeder 
{

    //-------------------[VARIABLE]-------------------
    #_controllerList = 
    [
        "x360",
        "ds4",
        "hotas",
        "yoke"
    ]

    #_otherButtonNames = 
    {
        "SCREENSHOT" : false,
        "GYRO" : false,
        "VIBRATION" : false
    }
    #_activeController

    // > Variable to contain the Vigem Driver 
    #_controller
    #_client

    // > Used to contain functions

    #_controllerFunctions = []

    #_generalFunctions = []

    //-------------------[VARIABLE]-------------------

    
    //-------------------[Constructor]-------------------

    constructor(controller, notificationCallback) // Input ex : new feeder("x360", function(){//Do Something})
    {

        if (!(controller in this.#_controllerList)) return false // > Check for controller if exists

        // > _activeController from the server.js
        this.#_activeController = controller

        // > Initiate _controllerFunctions
        this.#initiateFunctions()

        // > Initiate _generalFunctions
        this.#initiateGeneralFunctions()

        // > Calling the right feeder with _activeController from the _controllerFunctions
        this.#_controllerFunctions[this.#_activeController](notificationCallback)
    }

    #initiateFunctions()
    {
        this.#_controllerFunctions["x360"] = function(notificationCallback){this.#x360(notificationCallback)}
        this.#_controllerFunctions["ds4"] = function(notificationCallback){this.#ds4(notificationCallback)}
    }

    #initiateGeneralFunctions()
    {
        switch(this.#_activeController)
        {
            case this.#_controllerList[0]:
                this.#_generalFunctions["button"] = function(buttonName, buttonValue){this.#x360SetButtonValue(buttonName, buttonValue)}
                this.#_generalFunctions["axis"] = function(axisName, axisValue){this.#x360SetAxisValue(axisName, axisValue)}
                this.#_generalFunctions["toggle"] = function(buttonName){this.#x360ToggleButton(buttonName)}
                break
            case this.#_controllerList[1]:
                break
            default:
        }
    }

    //-------------------[Constructor]-------------------

    //-------------------[VigemBus Driver]-------------------

    #connectClient()
    {
        // > Calling the vigemclient
        this.#_client = new ViGEmClient()

        // > Error variable
        let err = this.#_client.connect() // > establish connection to the ViGEmBus driver
        return err
    }

    #connectController(controllerName)
    {
        // > Spawning the right controller
        switch(controllerName)
        {
            case this.#_controllerList[0]:
                this.#_controller = this.#_client.createX360Controller() // > Spawn x360 virtual controller
                break
            case this.#_controllerList[1]:
                this.#_controller = this.#_client.createDS4Controller() // > Spawn ds4 virtual controller
                break
            default:
                this.#_controller = this.#_client.createX360Controller() // > Spawn x360 virtual controller as default
        }

    }

    disconnectController()
    {
        let err = this.#_controller.disconnect(); // > Disconnecting the controller
        return err;
    }

    #updateController()
    {
        this.#_controller.update(); // > update manually for better performance
    }

    #controllerInfo(controllerName)
    {
        console.log("Vendor ID:", this.#_controller.vendorID);
        console.log("Product ID:", this.#_controller.productID);
        console.log("Index:", this.#_controller.index);
        console.log("Type:", this.#_controller.type);
        if(controllerName == this.#_controllerList[0])
        {
            console.log("User index:", this.#_controller.userIndex);
        }
    }

    //-------------------[VigemBus Driver]-------------------

    //-------------------[General Functions]-------------------

    setButtonValue(buttonName, buttonValue)
    {
        this.#_generalFunctions["button"](buttonName, buttonValue)
    }

    setAxisValue(axisName, axisValue)
    {
        this.#_generalFunctions["axis"](axisName, axisValue)
    }

    toggleButton(buttonName)
    {
        this.#_generalFunctions["toggle"](buttonName)
    }

    //-------------------[General Functions]-------------------

    //-------------------[XBOX 360 FEEDER]-------------------

    #x360(notificationCallback)
    {
        let connectClient = this.#connectClient()

        if(connectClient == null)
        {
            let connectController = this.#connectController(this.#_activeController)

            if(connectController)
            {
                console.log(connectController.message) // > Outputting the error message
                process.exit(1);
            }

            this.#controllerInfo(this.#_activeController) // > Outputting the controller info

            // > Fetching the notification
            this.#_controller.on("notification", data => {
                console.log("notification", data);
                // if(data.LargeMotor > 0 || data.SmallMotor > 0)
                // {
                //     notificationCallback(true);
                // } else {
                //     notificationCallback(false);
                // }
            });

            this.#_controller.updateMode = "manual"; // requires manual calls to controller.update()

        }
    }

    #x360SetButtonValue(buttonName, buttonValue)
    {
        if (buttonName in this.#_controller.button) // > Check native button in x360
        {
            this.#_controller.button[buttonName].setValue(buttonValue === true) // > Changing the value of the button
            this.#updateController()
        } else if (buttonName in this.#_otherButtonNames) // > Checkin for the custom buttons
        {
            // > Do Something with the custom button
        } else {
            return false
        }
    }

    #x360ToggleButton(buttonName)
    {
        if (!(buttonName in this.#_controller.button)) return false // > Check native button in x360
        this.#_controller.button[buttonName].setValue(!this.#_controller.button[buttonName].value); // invert button value
        this.#updateController()
    }

    #x360SetAxisValue(axisName, axisValue)
    {
        if (!(axisName in this.#_controller.axis)) return false // > Check native axis in x360
        this.#_controller.axis[axisName].setValue(axisValue) // > Changing the value of the axis
        this.#updateController()
    }

    //-------------------[DUALSHOCK 4 FEEDER]-------------------

    #ds4(notificationCallback)
    {

    }
}

module.exports = feeder;