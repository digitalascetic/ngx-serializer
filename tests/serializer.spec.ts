import * as moment from 'moment';
import {SerializerService} from "../src/serializer.service";
import {
    SerializerExclude, SerializerReplace, SerializerTransformer
} from "../src/serializer.metadata";
import {PostDeSerializeListener} from "../src/post.deserialize.listener";
import {PrimaryKeyObject, PropertyAccessorMapper, DateTransformer} from "@digitalascetic/ngx-object-transformer";
import {Type} from "@digitalascetic/ngx-reflection";

class TestSer implements PrimaryKeyObject {

    getPrimaryKeyPropertyName(): string {
        return "id";
    }

    @Type()
    public id: number;

    @Type(() => TestSer)
    public relatedTestSer: TestSer|null;

    constructor(id: number, relatedTestSer: TestSer|null) {
        this.id = id;
        this.relatedTestSer = relatedTestSer;
    }

}

describe('SerializerService tests', () => {

    let serializer: SerializerService = new SerializerService({propNameMapper: new PropertyAccessorMapper()});

    it('should serialize with id reference replacement', () => {

        let testDesc = new TestDescription('desc', 23);
        let testDecorator = new TestDecoratorClass(testDesc, 'notInSer', 99);

        let testDecoratorSer = serializer.serialize(testDecorator);
        let parsedTestDec = JSON.parse(testDecoratorSer);

        expect(parsedTestDec).toBeDefined();
        expect(parsedTestDec.description).toBeDefined();
        expect(parsedTestDec.description.id).toBeDefined();
        expect(parsedTestDec.description.id).toBe(23);
        expect(parsedTestDec.inSer).toBeDefined();
        expect(parsedTestDec.inSer).toBe(99);
        expect(parsedTestDec.notInSer).not.toBeDefined()


    });
    /*
   it('Should serialize dates as for SerializerType specified format', () => {

       let agency: Agency = new Agency('Test agency', 1);

       let agencyCompany: AgencyCompany = new AgencyCompany('Bluplat s.l.', 'HIIIIIIII', new Address());

       let startDate: Date = moment('2016-01-01').toDate();

       let endDate: Date = moment('2016-05-01').toDate();
       let agencyContract: AgencyContract = new AgencyContract(agency, agencyCompany, startDate, endDate, 1);

       let contractSerialized = serializer.serialize(agencyContract);
       let contactDeserialized = JSON.parse(contractSerialized);

       expect(contactDeserialized.startDate).toBe('2016-01-01');
       expect(contactDeserialized.endDate).toBe('2016-05-01');

   });

   it('Should serialize properly arrays', () => {

       let agency: Agency = new Agency('Test agency', 1);
       let agency2: Agency = new Agency('Test agency 2', 2);

       let agencyArray = [agency, agency2];

       let arraySerialized = serializer.serialize(agencyArray);
       let arrayDeserialized = JSON.parse(arraySerialized);

       expect(arrayDeserialized[0].id).toBe(1);
       expect(arrayDeserialized[1].id).toBe(2);

   });
    */
    it('Should properly handle circular references', () => {

        let testSer1 = new TestSer(1, null);
        let testSer2 = new TestSer(2, null);
        let testSer3 = new TestSer(3, null);
        let testSer11 = new TestSer(4, testSer1);
        testSer1.relatedTestSer = testSer11;

        let testSer2Serialized = serializer.serialize(testSer2);

        let testSer2Deserialized = JSON.parse(testSer2Serialized);

        let testSer3Serialized = serializer.serialize(testSer3);
        let testSer3Deserialized = JSON.parse(testSer3Serialized);

        expect(testSer2Deserialized.id).toBe(2);
        expect(testSer3Deserialized.id).toBe(3);

        let testSer11Serialized = serializer.serialize(testSer11);

        let testSer11Deserialized = JSON.parse(testSer11Serialized);


        expect(testSer11Deserialized.id).toBe(4);
        expect(testSer11Deserialized.relatedTestSer.id).toBe(1);
        expect(testSer11Deserialized.relatedTestSer.relatedTestSer.id).toBe(4);
        expect(testSer11Deserialized.relatedTestSer.relatedTestSer.relatedTestSer).toBeUndefined();

    });

    it('Should transformToObject correctly encode simple primitives as simple strings', () => {

        let emptyString = '';
        let serializedEmptyString = serializer.serialize(emptyString);
        let parsedEmptyString = JSON.parse(serializedEmptyString);

        expect(serializedEmptyString).toBe('""');
        expect(parsedEmptyString).toBe('');

    });

    it('Should deserialize correctly primitives', () => {

        let primitiveNumber = "1";
        let desNumber = serializer.deserialize(primitiveNumber);
        let primitiveString = "\"astring\"";
        let desString = serializer.deserialize(primitiveString);

        expect(desNumber).toBe(1);
        expect(desString).toBe("astring");

    });

    it('should deserialize correctly plain objects', () => {

        let plainObject = '{"name": "test", "surname": "surnametest"}';
        let desPlainObj = serializer.deserialize(plainObject);

        expect(desPlainObj).toEqual({name: "test", surname: "surnametest"});

    });

    it('should deserialize correctly custom objects', () => {

        let parsedTestDesc = '{"id": 1, "text": "description text", "noshow": "removed text"}';
        let desTestDesc: any = serializer.deserialize(parsedTestDesc, TestDescription);
        expect(desTestDesc).toBeDefined();
        expect(desTestDesc instanceof TestDescription).toBeTruthy();
        expect(desTestDesc.id).toBe(1);
        expect(desTestDesc.text).toBe("description text");
        expect(desTestDesc.noshow).not.toBeDefined();

    });

    it('should deserialize from object correctly composed objects', () => {

        let jsonTestObject = '{ "name": "testObject", "description": {"id": 1, "text": "description text"}, "startDate": "2016-01-01"}';
        let desTestObject = serializer.deserialize(jsonTestObject, TestClass);

        expect(desTestObject).toBeDefined();
        expect(desTestObject instanceof TestClass).toBeTruthy();
        expect(desTestObject.name).toBeDefined();
        expect(desTestObject.description).toBeDefined();
        expect(desTestObject.description instanceof TestDescription).toBeTruthy();
        expect(desTestObject.description.id).toBe(1);
        expect(desTestObject.description.text).toBe("description text");
        expect(desTestObject.startDate).toBeDefined();
        expect(desTestObject.startDate.getTime()).toBe(1451602800000);

    });

    it('should deserialize from object correctly deeply composed objects', () => {

        let jsonTestObject = '{ "id": 1, "testClass": { "name": "testObject", "description": {"id": 1, "text": "description text"}, "startDate": "2016-01-01"}}';
        let desTestObject: ComposedTestClass = serializer.deserialize(jsonTestObject, ComposedTestClass);

        expect(desTestObject).toBeDefined();
        expect(desTestObject instanceof ComposedTestClass).toBeTruthy();
        expect(desTestObject.id).toBe(1);
        expect(desTestObject.testClass.name).toBeDefined();
        expect(desTestObject.testClass.description).toBeDefined();
        expect(desTestObject.testClass.description instanceof TestDescription).toBeTruthy();
        expect(desTestObject.testClass.description.text).toBe("description text");
        expect(desTestObject.testClass.startDate).toBeDefined();
        expect(desTestObject.testClass.startDate.getTime()).toBe(1451602800000);

    });

    it('should deserialize from object correctly composed objects with inheritance', () => {

        let jsonTestObject = '{ "name": "testObject", "childType": "myChild", "description": {"id": 1, "text": "description text"}, "startDate": "2016-01-01"}';
        let desTestObject = serializer.deserialize(jsonTestObject, ChildTestClass);

        expect(desTestObject).toBeDefined();
        expect(desTestObject instanceof ChildTestClass).toBeTruthy();
        expect(desTestObject.name).toBeDefined();
        expect(desTestObject.description).toBeDefined();
        expect(desTestObject.description instanceof TestDescription).toBeTruthy();
        expect(desTestObject.description.id).toBe(1);
        expect(desTestObject.description.text).toBe("description text");
        expect(desTestObject.startDate).toBeDefined();
        expect(desTestObject.startDate.getTime()).toBe(1451602800000);
        expect(desTestObject.childType).toBe("myChild");

    });

    it('should deserialize correctly custom objects with undefined properties', () => {

        let parsedTestDesc = '{"id": 1, "name": "test", "compProp": {"name": "comp", "test": true, "parent": {"name": "parentComp", "test": true, "parent": null} }}';
        let desTestDesc: UndefinedPropTestClass = serializer.deserialize(parsedTestDesc, UndefinedPropTestClass);

        expect(desTestDesc).toBeDefined();
        expect(desTestDesc instanceof UndefinedPropTestClass).toBeTruthy();
        expect(desTestDesc.id).toBe(1);
        expect(desTestDesc.name).toBe("test");
        expect(desTestDesc.compProp).toBeDefined();
        expect(desTestDesc.compProp instanceof ComposedUndefinedProp).toBeTruthy();
        expect(desTestDesc.compProp.name).toBe("comp");
        expect(desTestDesc.compProp.test).toBe(true);
        expect(desTestDesc.compProp.parent).toBeDefined();
        expect(desTestDesc.compProp.parent instanceof ComposedUndefinedProp).toBeTruthy();
        expect(desTestDesc.compProp.parent.name).toBe("parentComp");
        expect(desTestDesc.compProp.parent.test).toBe(true);
        expect(desTestDesc.compProp.parent.parent).toBeNull();

    });

    it('should not deserialize excluded properties', () => {

        let jsonTestObject = '{ "notInSer": "no show", "description": {"id": 1, "text": "description text"}, "inSer": 55}';
        let desTestObject = serializer.deserialize(jsonTestObject, TestDecoratorClass);

        expect(desTestObject).toBeDefined();
        expect(desTestObject instanceof TestDecoratorClass).toBeTruthy();
        expect(desTestObject.inSer).toBeDefined();
        expect(desTestObject.inSer).toBe(55);
        expect(desTestObject.description).toBeDefined();
        expect(desTestObject.description instanceof TestDescription).toBeTruthy();
        expect(desTestObject.description.id).toBe(1);
        expect(desTestObject.description.text).toBe("description text");
        expect(desTestObject.notInSer).not.toBeDefined();

    });

    it('should deserialize array', () => {

        let jsonArray = '[1, 2, 3]';
        let desArray = serializer.deserialize(jsonArray);

        expect(desArray).toBeDefined();
        expect(desArray instanceof Array).toBeTruthy();
        expect(desArray[0]).toBeDefined();
        expect(desArray[0]).toBe(1);
        expect(desArray[1]).toBe(2);
        expect(desArray[2]).toBeDefined();
        expect(desArray[2]).toBe(3);
        expect(desArray[4]).not.toBeDefined();

    });

    it('should deserialize array of custom objects', () => {

        let parsedObj = '{ "name": "testHolder", "descs": [{"id": 1, "text": "description text"}, {"id": 2, "text": "description text 2"}, {"id": 3, "text": "description text 3"}]}';
        let desObj = serializer.deserialize(parsedObj, TestDescriptionHolder);

        expect(desObj).toBeDefined();
        expect(desObj instanceof TestDescriptionHolder).toBeTruthy();

        expect(desObj.name).toBeDefined();
        expect(desObj.name).toBe("testHolder");

        expect(desObj.descs).toBeDefined();
        expect(desObj.descs instanceof Array).toBeTruthy();

        expect(desObj.descs[0]).toBeDefined();
        expect(desObj.descs[0] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[1]).toBeDefined();
        expect(desObj.descs[1] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[1].id).toBe(2);
        expect(desObj.descs[2]).toBeDefined();
        expect(desObj.descs[2] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[2].id).toBe(3);
        expect(desObj.descs[4]).not.toBeDefined();

    });

    it('should execute post deserialization listeners (change property)', () => {

        let serializer = new SerializerService({
            propNameMapper: new PropertyAccessorMapper(),
            postDeserializeListeners: [new TestDescriptionHolderPostDeserializationListener()]
        });
        let parsedObj = '{ "name": "testHolder", "descs": [{"id": 1, "text": "description text"}, {"id": 2, "text": "description text 2"}, {"id": 3, "text": "description text 3"}]}';
        let desObj = serializer.deserialize(parsedObj, TestDescriptionHolder);

        expect(desObj).toBeDefined();
        expect(desObj instanceof TestDescriptionHolder).toBeTruthy();

        expect(desObj.name).toBeDefined();
        expect(desObj.name).toBe("name changed");

        expect(desObj.descs).toBeDefined();
        expect(desObj.descs instanceof Array).toBeTruthy();

        expect(desObj.descs[0]).toBeDefined();
        expect(desObj.descs[0] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[1]).toBeDefined();
        expect(desObj.descs[1] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[1].id).toBe(2);
        expect(desObj.descs[2]).toBeDefined();
        expect(desObj.descs[2] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[2].id).toBe(3);
        expect(desObj.descs[4]).not.toBeDefined();

    });

    it('should execute post deserialization listeners (object replace)', () => {

        let serializer = new SerializerService({
            propNameMapper: new PropertyAccessorMapper(),
            postDeserializeListeners: [new TestDescriptionHolderPostDeserializationListener(), new TestDescriptionHolderPostDeserializationListener2()]
        });
        let parsedObj = '{ "name": "testHolder", "descs": [{"id": 1, "text": "description text"}, {"id": 2, "text": "description text 2"}, {"id": 3, "text": "description text 3"}]}';
        let desObj = serializer.deserialize(parsedObj, TestDescriptionHolder);

        expect(desObj).toBeDefined();
        expect(desObj).toBe("new object");

    });

    it('should execute post deserialization listeners (apply deserialization listeners to deserialized properties)', () => {

        let serializer = new SerializerService({
            propNameMapper: new PropertyAccessorMapper(),
            postDeserializeListeners: [new TestDescriptionPostDeserializationListener()]
        });
        let parsedObj = '{ "name": "testHolder", "descs": [{"id": 1, "text": "description text"}, {"id": 2, "text": "description text 2"}, {"id": 3, "text": "description text 3"}]}';
        let desObj = serializer.deserialize(parsedObj, TestDescriptionHolder);

        expect(desObj).toBeDefined();
        expect(desObj instanceof TestDescriptionHolder).toBeTruthy();

        expect(desObj.name).toBeDefined();
        expect(desObj.name).toBe("testHolder");

        expect(desObj.descs).toBeDefined();
        expect(desObj.descs instanceof Array).toBeTruthy();

        expect(desObj.descs[0]).toBeDefined();
        expect(desObj.descs[0] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[0].text).toBe('new text');
        expect(desObj.descs[1]).toBeDefined();
        expect(desObj.descs[1] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[1].id).toBe(2);
        expect(desObj.descs[2]).toBeDefined();
        expect(desObj.descs[2] instanceof TestDescription).toBeTruthy();
        expect(desObj.descs[2].id).toBe(3);
        expect(desObj.descs[4]).not.toBeDefined();

    });


});

class TestDescription {

    @Type(() => Number)
    private _id: number | undefined;

    private _text: string;

    constructor(text: string, id?: number) {
        this._text = text;
        this._id = id;
    }


    get id(): number | undefined {
        return this._id;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
    }
}

class ExtendedTestDescription extends TestDescription {

    private _moreDescription: string;

    constructor(text: string, id: number, moreDescription: string) {
        super(text, id);
        this._moreDescription = moreDescription;
    }

    get moreDescription(): string {
        return this._moreDescription;
    }

    set moreDescription(value: string) {
        this._moreDescription = value;
    }
}


class ComposedTestClass {

    @Type()
    private _id: number;

    @Type(() => TestClass)
    private _testClass: TestClass;

    constructor(id: number, testClass: TestClass) {
        this._id = id;
        this._testClass = testClass;
    }

    get testClass(): TestClass {
        return this._testClass;
    }

    set testClass(value: TestClass) {
        this._testClass = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }
}

class TestClass {

    private _name: string;

    @Type(() => TestDescription)
    private _description: TestDescription;

    @SerializerTransformer(new DateTransformer("YYYY-MM-DD"))
    @Type(() => Date)
    private _startDate: Date;

    constructor(name: string, description: TestDescription, startDate: Date) {
        this._name = name;
        this._description = description;
        this._startDate = startDate;
    }


    get name(): string {
        return this._name;
    }

    get description(): TestDescription {
        return this._description;
    }

    get startDate(): Date {
        return this._startDate;
    }
}

class ChildTestClass extends TestClass {

    private _childType: number;

    constructor(name: string, description: TestDescription, startDate: Date, childType: number) {
        super(name, description, startDate);
        this._childType = childType;
    }

    get childType(): number {
        return this._childType;
    }
}

class TestDecoratorClass {

    @SerializerReplace("id")
    @Type(() => TestDescription)
    private _description: TestDescription;

    @SerializerExclude()
    private _notInSer: string;

    private _inSer: number;

    constructor(description: TestDescription, notInSer: string, inSer: number) {
        this._description = description;
        this._notInSer = notInSer;
        this._inSer = inSer;
    }

    get description(): TestDescription {
        return this._description;
    }

    get notInSer(): string {
        return this._notInSer;
    }

    get inSer(): number {
        return this._inSer;
    }
}

class TestDescriptionHolder {

    private _name: string;

    private _type: string;

    @Type(() => TestDescription)
    private _descs: Array<TestDescription>;

    constructor(name: string, descs: Array<TestDescription>) {
        this._name = name;
        this._descs = descs || [];
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get type(): string {
        return this._type;
    }

    get descs(): Array<TestDescription> {
        return this._descs;
    }
}

class UndefinedPropTestClass {

    @Type()
    private _name: string;

    @Type()
    private _id: number;

    @Type(() => ComposedUndefinedProp)
    private _compProp: ComposedUndefinedProp;

    constructor(name: string) {
        this._name = name;
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }


    get compProp(): ComposedUndefinedProp {
        return this._compProp;
    }

    set compProp(value: ComposedUndefinedProp) {
        this._compProp = value;
    }
}

class ComposedUndefinedProp {

    @Type()
    private _name: string;

    @Type()
    private _test: boolean;

    @Type(() => ComposedUndefinedProp)
    private _parent: ComposedUndefinedProp;


    constructor(name: string) {
        this._name = name;
    }


    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get test(): boolean {
        return this._test;
    }

    set test(value: boolean) {
        this._test = value;
    }

    get parent(): ComposedUndefinedProp {
        return this._parent;
    }

    set parent(value: ComposedUndefinedProp) {
        this._parent = value;
    }
}

class TestDescriptionPostDeserializationListener implements PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any {
        if (clazz === TestDescription) {
            let td: TestDescription = obj;
            td.text = 'new text';
        }
    }

}

class TestDescriptionHolderPostDeserializationListener implements PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any {
        if (clazz === TestDescriptionHolder) {
            let tdh: TestDescriptionHolder = obj;
            tdh.name = 'name changed';
        }
    }

}

class TestDescriptionHolderPostDeserializationListener2 implements PostDeSerializeListener {

    onPostDeserialize(obj: any, clazz?: Function): any {
        if (clazz === TestDescriptionHolder) {
            return "new object";
        }
    }

}
