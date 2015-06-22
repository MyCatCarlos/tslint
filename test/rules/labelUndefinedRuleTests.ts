/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe("<label-undefined>", () => {
    const LabelUndefinedRule = Lint.Test.getRule("label-undefined");
    const fileName = "rules/label-undefined.test.ts";
    const failureString = LabelUndefinedRule.FAILURE_STRING;

    it("forbids the use of undefined labels", () => {
        const expectedFailures: Lint.RuleFailure[] = [
            Lint.Test.createFailure(fileName, [6, 9], [6, 14], failureString + "lab1'"),
            Lint.Test.createFailure(fileName, [13, 9], [13, 17], failureString + "lab2'"),
            Lint.Test.createFailure(fileName, [27, 17], [27, 22], failureString + "lab3'"),
            Lint.Test.createFailure(fileName, [36, 9], [36, 17], failureString + "lab4'")
        ];
        const actualFailures = Lint.Test.applyRuleOnFile(fileName, LabelUndefinedRule);

        Lint.Test.assertFailuresEqual(actualFailures, expectedFailures);
    });
});
