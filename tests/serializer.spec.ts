import {SerializerService} from "../src/serializer.service";
import {PropertyAccessorMapper} from "@digitalascetic/ngx-object-transformer";
import {TestSer} from "./testclass/test.ser";
import {TestDescription} from "./testclass/test.description";
import {TestDescriptionHolder} from "./testclass/test.description.hoilder";
import {TestDecoratorClass} from "./testclass/test.decorator.class";
import {TestClass} from "./testclass/test.class";
import {ComposedTestClass} from "./testclass/composed.test.class";
import {ChildTestClass} from "./testclass/child.test.class";
import {UndefinedPropTestClass} from "./testclass/undefined.prop.test.class";
import {ComposedUndefinedProp} from "./testclass/composed.unidefined.prop";
import {TestDescriptionPostDeserializationListener} from "./testclass/test.description.post.deserialization.listener";
import {TestDescriptionHolderPostDeserializationListener} from "./testclass/test.description.holder.post.deserialization.listener";
import {TestDescriptionHolderPostDeserializationListener2} from "./testclass/test.description.holder.post.deserialization.listener2";
import moment = require("moment");
import {SerializerConfig} from "../src/serializer.config";


describe('SerializerService tests', () => {

    let serializerConfig = new SerializerConfig(new PropertyAccessorMapper());
    let serializer: SerializerService = new SerializerService(serializerConfig);

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

    it('Should serialize dates as for DateTransformer format', () => {

        let startDate: Date = moment('2016-01-01').toDate();

        let testObject: TestClass = new TestClass('Test agency', new TestDescription('description'), startDate);


        let testObjSerialized = serializer.serialize(testObject);
        let testObjectDeserialized = JSON.parse(testObjSerialized);

        expect(testObjectDeserialized.startDate).toBe('2016-01-01');


    });

    it('Should properly serialize arrays', () => {

        let desc: TestDescription = new TestDescription('Test description', 1);
        let desc2: TestDescription = new TestDescription('Test description 2', 2);

        let descArray = [desc, desc2];

        let arraySerialized = serializer.serialize(descArray);
        let arrayDeserialized = JSON.parse(arraySerialized);

        expect(arrayDeserialized[0].id).toBe(1);
        expect(arrayDeserialized[1].id).toBe(2);

    });

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
        expect(desTestObject.startDate.getFullYear()).toBe(2016);
        expect(desTestObject.startDate.getMonth()).toBe(0);
        expect(desTestObject.startDate.getDate()).toBe(1);

    });

    it('should deserialize from object correctly deeply composed objects', () => {

        let jsonTestObject = '{ "id": 1, "testClass": { "name": "testObject", "description": {"id": 1, "text": "description text"}, "startDate": "2017-02-20"}}';
        let desTestObject: ComposedTestClass = serializer.deserialize(jsonTestObject, ComposedTestClass);

        expect(desTestObject).toBeDefined();
        expect(desTestObject instanceof ComposedTestClass).toBeTruthy();
        expect(desTestObject.id).toBe(1);
        expect(desTestObject.testClass.name).toBeDefined();
        expect(desTestObject.testClass.description).toBeDefined();
        expect(desTestObject.testClass.description instanceof TestDescription).toBeTruthy();
        expect(desTestObject.testClass.description.text).toBe("description text");
        expect(desTestObject.testClass.startDate).toBeDefined();
        expect(desTestObject.testClass.startDate.getFullYear()).toBe(2017);
        expect(desTestObject.testClass.startDate.getMonth()).toBe(1);
        expect(desTestObject.testClass.startDate.getDate()).toBe(20);

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
        expect(desTestObject.startDate.getFullYear()).toBe(2016);
        expect(desTestObject.startDate.getMonth()).toBe(0);
        expect(desTestObject.startDate.getDate()).toBe(1);
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

        let serializerConfig = new SerializerConfig(
            new PropertyAccessorMapper(),
            [new TestDescriptionHolderPostDeserializationListener()]);
        let serializer = new SerializerService(serializerConfig);
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

        let serializerConfig = new SerializerConfig(
            new PropertyAccessorMapper(),
            [new TestDescriptionHolderPostDeserializationListener(), new TestDescriptionHolderPostDeserializationListener2()]);
        let serializer = new SerializerService(serializerConfig);

        let parsedObj = '{ "name": "testHolder", "descs": [{"id": 1, "text": "description text"}, {"id": 2, "text": "description text 2"}, {"id": 3, "text": "description text 3"}]}';
        let desObj = serializer.deserialize(parsedObj, TestDescriptionHolder);

        expect(desObj).toBeDefined();
        expect(desObj).toBe("new object");

    });

    it('should execute post deserialization listeners (apply deserialization listeners to deserialized properties)', () => {

        let serializerConfig = new SerializerConfig(
            new PropertyAccessorMapper(),
            [new TestDescriptionPostDeserializationListener()]);
        let serializer = new SerializerService(serializerConfig);

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
