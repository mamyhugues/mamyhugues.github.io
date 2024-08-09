import api from "../common/Api";
import apif from "../common/Apif";
import AuthService from "./auth.service";

const API_URL = "http://localhost:8000/api/";

const sendOperations = (user_id, rawData) => {
    return api.post(API_URL + "operation", {
        user_id,
        rawData
    }).then(
        (res) => {
            return {
                'statut': 'success',
                'message': res.data.message
            }
        },
        (error) => {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return {
                'statut': 'error',
                'message': resMessage
            }
        }
    );
}

const handleSendOperation = () => {
    //get Data from localstorage
    let operationsData = localStorage.getItem('operations');
    let arrOperations = JSON.parse(operationsData);
    let arrStatut = arrOperations.map(op => op.statut).filter(s => s !== 'terminé');
    if (arrStatut.length !== 0) {
        return {
            'statut': 'error',
            'message': 'Veuillez valider les statuts (terminés)'
        };
    }

    const user = AuthService.getCurrentUser();
    return sendOperations(user.id, arrOperations)
}

const getUme = (type, prevUme, montant) => {
    let newUme = 0;
    switch (type) {
        case '2': newUme = prevUme + montant;
            break;
        default:
            newUme = prevUme - montant;
    }
    return newUme;
}

const recalculateUme = (arrOperation, operation) => {
    if (arrOperation.length === 1) {
        arrOperation[0].ume = getUme(arrOperation[0].type, parseFloat(localStorage.getItem('initial-montant')),
            arrOperation[0].montant);
    } else {
        let oldUme = parseFloat(localStorage.getItem('initial-montant'));
        if (operation.id === 1) {
            oldUme = getUme(arrOperation[0].type, oldUme, arrOperation[0].montant);
            arrOperation[0].ume = oldUme
        } else {
            oldUme = arrOperation[operation.id - 2].ume;
        }

        for (let op of arrOperation) {
            if (op.id >= operation.id && op.id !== 1) {
                let newUme = getUme(op.type, oldUme, op.montant);
                oldUme = newUme;
                op.ume = newUme;
            }
        }
    }
    return arrOperation;
}

const reorderId = (arrOperation) => {
    const newArr = [];
    let key = 1;
    for (let op of arrOperation) {
        op.id = key;
        newArr.push(op);
        key++;
    }
    return newArr;
}

const downloadExcel = (values) => {
    return apif.get(API_URL + "operation/download/" + values.utilisateur + "/" + values.date)
}

const OperationService = {
    handleSendOperation,
    getUme,
    recalculateUme,
    reorderId,
    downloadExcel,
}

export default OperationService;
