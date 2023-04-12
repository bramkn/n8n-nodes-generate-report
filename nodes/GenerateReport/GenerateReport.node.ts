import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import * as iconv from 'iconv-lite';
iconv.encodingExists('utf8');

import { TemplateData, TemplateHandler } from 'easy-template-x';

const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

// Create options for bomAware and encoding
const bomAware: string[] = [];
const encodeDecodeOptions: INodePropertyOptions[] = [];
const encodings = (iconv as any).encodings; // tslint:disable-line:no-any
Object.keys(encodings).forEach(encoding => {
	if (!(encoding.startsWith('_') || typeof encodings[encoding] === 'string')) { // only encodings without direct alias or internals
		if (encodings[encoding].bomAware) {
			bomAware.push(encoding);
		}
		encodeDecodeOptions.push({ name: encoding, value: encoding });
	}
});

encodeDecodeOptions.sort((a, b) => {
	if (a.name < b.name) { return -1; }
	if (a.name > b.name) { return 1; }
	return 0;
});

export class GenerateReport implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Generate Report',
		name: 'generateReport',
		icon: 'file:report_template.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate a report from a DocX Template and JSON data.',
		defaults: {
			name: 'Generate Report',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Template Key',
				name: 'sourceKey',
				type: 'string',
				default: 'template',
				required: true,
				placeholder: 'template',
				description: 'The name of the binary key to get the template from. It is also possible to define deep keys by using dot-notation like for example: "level1.level2.currentKey".',
			},
			{
				displayName: 'Output Key',
				name: 'destinationKey',
				type: 'string',
				default: 'report',
				required: true,
				placeholder: 'report',
				description: 'The name of the binary key to copy data to. It is also possible to define deep keys by using dot-notation like for example: "level1.level2.newKey".',
			},
			{
				displayName: 'Input Data',
				name: 'data',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'data',
				description: 'Data to use to fill the report. Insert as string, so please use JSON.stringify(data) if needed.',
			},
			{
				displayName: 'Output File Name',
				name: 'outputFileName',
				type: 'string',
				default: 'Report',
				required: true,
				placeholder: 'Report',
				description: 'File name of the output document, enter without extension',
			},
			{
				displayName: 'Convert to PDF',
				name: 'convertToPDF',
				type: 'boolean',
				default: false,
				required: true,
				description: 'Whether or not to convert the output file to PDF format',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const flattenJSON = (obj = {} as IDataObject, res = {} as IDataObject, extraKey = '' as string) => {
			for(var key in obj){
			   if(typeof obj[key] !== 'object'){
				  res[extraKey + key] = obj[key];
			   }else{
				  if(Array.isArray(obj[key])){
					 res[extraKey + key] = obj[key];
				  }
				  else{
					 flattenJSON(obj[key] as IDataObject, res, `${extraKey}${key}.`);
				  }
			   };
			};
			return res;
		 };

		const items = this.getInputData();

		const returnData: INodeExecutionData[] = [];

		let item: INodeExecutionData;
		let newItem: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			item = items[itemIndex];
			newItem = {
				json: {},
				binary: {},
			};

			const sourceKey = this.getNodeParameter('sourceKey', itemIndex) as string;
			const destinationKey = this.getNodeParameter('destinationKey', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;
			const outputFileName = this.getNodeParameter('outputFileName', itemIndex) as string;
			const convertToPDF = this.getNodeParameter('convertToPDF', itemIndex,false) as boolean;
			let templateData;
			try{
				templateData = flattenJSON(JSON.parse(data)) as TemplateData;
			}
			catch(err){
				throw new NodeOperationError(this.getNode(), 'Something went wrong while parsing the template data.' + err as string);
			}

			if (item.binary === undefined) {
				throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
			}

			const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, sourceKey);

			const handler = new TemplateHandler({
				delimiters: {
						tagStart: "{{",
						tagEnd: "}}",
						containerTagOpen: "#",
						containerTagClose: "/"
				},
			});

			try{

				const doc = await handler.process(binaryDataBuffer, templateData);

				if(convertToPDF){
					let pdfBuf;
					try{
						pdfBuf = await libre.convertAsync(doc, '.pdf', undefined);
					}
					catch(err){
						throw new NodeOperationError(this.getNode(),err as string)
					}

					newItem.binary![destinationKey] = await this.helpers.prepareBinaryData(pdfBuf, `${outputFileName}.pdf`);
				}
				else{
					newItem.binary![destinationKey] = await this.helpers.prepareBinaryData(doc, `${outputFileName}.docx`);
				}

			}
			catch(err){
				throw new NodeOperationError(this.getNode(), 'Something went wrong creating the report. ' + err as string);
			}





			returnData.push(newItem);
		}

		return [returnData];
	}
}
