/**
 * This function create modal window for editing models
 * @params {title} - title of modal
 * @params {subTitle} - title of modal
 * @params {fields} - fields to edit. Have to be in format {name: string, fieldTitle: string, type: input || select || dictionary-input, values: {id: string | number, value: string}[]} values - for select, name - target fieldName. If field type === select and name === password - input type will be password
 * @params {model} - model with fields above
 * @params {rejectButtonName} - reject button name
 * @params {submitButtonName} - submit button name
 * @params {rejectCallback} - reject callback
 * @params {submitCallback} - submit callback
 * @params {modalId} - unique Id of modal window
 */

const allowedTypes = ['input', 'select', 'dictionary-input'];

const dictExample = {
    type: 'dictionary-input',
    keyValueTitles: {
        key: 'Key',
        value: 'Value'
    },
    canAddNewLine: false
},

const inputGenerator = ({ fieldTitle, name }, model) => {
    const inputType = el.name === 'password' ? 'type="password"' : '';
    return `
        <label class="control-label" for="${name}Input">${fieldTitle}</label>
        <input ${inputType} id="${name}Input" value="${model && model[name]}" name="${name}" class="form-control" required autocomplete="new-password">
    `;
}

const selectGenerator = ({ name, fieldTitle, values }, model) => {
    const selectOptions = values.map(option => {
        return `
        <option value=${option.id}>${option.value}</option>
        `;
    });
    return `
        <label class="control-label" for="${name}Select">${fieldTitle}</label>
        <select class="form-control" id="${name}Select" name="${name}">
            ${selectOptions}
        </select>
    `;
}

export default createModalWindow = (
    title,
    subTitle,
    fields,
    model,
    rejectButtonName,
    submitButtonName,
    rejectCallback,
    submitCallback,
    modalId) => {
    const fieldsSection = fields.map(el => {
        if (el.type === 'input') {
            return inputGenerator(el, model)
        } else if (el.type === 'select') {
            return selectGenerator(el, model);
        }
    }).join(' ');

    const html = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">${title}</h4>
                    <small class="font-bold">${subTitle}</small>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="form-group">
                                <form autocomplete="off">
                                    ${fieldsSection}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            <div class="modal-footer">
                <button id="close-edit-window-button-${modalId}" type="button" class="btn btn-white"
                    data-dismiss="modal">${rejectButtonName}</button>
                <button id="submit-edit-window-button-${modalId}" type="button" class="btn btn-primary">${submitButtonName}</button>
            </div>
        </div>
    </div >
    `;

    const id = `#${modalId}`;

    if (!$(id).length) {
        const container = `<div class="modal inmodal" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="true"></div> `;
        $('body').append(container);
    }


    $(id).html(html);
    $(`#close-edit-window-button-${modalId}`).on('click', () => {
        $(id).css('display', 'none');
        if (rejectCallback) {
            rejectCallback();
        }
    });
    $(`#submit-edit-window-button-${modalId}`).on('click', () => {
        $(id).css('display', 'none');
        if (submitCallback) {
            submitCallback();
        }
    });

    $(id).css('display', 'block');
}



function createAndShowEditDynamicMappingModalWindow(model) {

    const title = 'Enter new values';
    const subTitle = 'Click submit to save new values';
    const fields = [
        {
            name: 'name',
            fieldTitle: 'Name',
            type: 'input'
        },
        {
            name: 'sqlQuery',
            fieldTitle: 'Sql Query',
            type: 'input'
        },
        {
            name: 'connectionId',
            fieldTitle: 'Connection',
            type: 'select',
            values: window.sp.connectionObjects.map(obj => {
                return { id: obj.id, value: obj.name };
            })
        },
        {
            name: 'formId',
            fieldTitle: 'Form Name',
            type: 'select',
            values: window.sp.forms.map(obj => {
                return { id: obj.id, value: obj.name };
            })
        }
    ];

    // const parsedMapping = JSON.parse(model.mapping);

    // model.mapping = undefined;
    // model.parsedMapping = parsedMapping;

    // for (let key in parsedMapping) {
    //     fields.push(
    //         {
    //             name: 'parsedMapping',
    //             fieldTitle: 'Column Name',
    //             type: 'input',
    //             nestedField: true,
    //             nestedFieldName : key
    //         }
    //     );
    //     fields.push(
    //         {
    //             name: parsedMapping[key],
    //             fieldTitle: 'Label Name',
    //             type: 'input',
    //             nestedField: true,
    //             nestedFieldName : key
    //         }
    //     );
    // }

    const modalId = 'update_dynamic_mapping';
    createEditModalWindow(title, subTitle, fields, model, 'Close', 'Submit',
        () => { },
        () => {
            const form = $(`#${modalId}`).find('form');
            const res = form.serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});
            res.id = model.id;
            res.mapping = model.mapping;
            console.log(res);

            updateDynamicMapping(res);
        }, modalId);
}