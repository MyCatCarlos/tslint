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

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "shadowed variable: '";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoShadowedVariableWalker(sourceFile, this.getOptions()));
    }
}

class NoShadowedVariableWalker extends Lint.BlockScopeAwareRuleWalker<ScopeInfo, ScopeInfo> {
    public createScope() {
        return new ScopeInfo();
    }

    public createBlockScope() {
        return new ScopeInfo();
    }

    public visitParameterDeclaration(node: ts.ParameterDeclaration) {
        // Treat parameters as block-scoped variables
        const propertyName = <ts.Identifier> node.name;
        const variableName = propertyName.text;
        const currentScope = this.getCurrentScope();
        const currentBlockScope = this.getCurrentBlockScope();

        if (this.isVarInAnyScope(variableName)) {
            this.addFailureOnIdentifier(propertyName);
        }
        currentScope.varNames.push(variableName);

        super.visitParameterDeclaration(node);
    }

    public visitTypeLiteral(node: ts.TypeLiteralNode) {
        // don't call super, we don't want to walk the inside of type nodes
    }

    public visitMethodSignature(node: ts.SignatureDeclaration) {
        // don't call super, we don't want to walk method signatures either
    }

    public visitCatchClause(node: ts.CatchClause) {
        // don't visit the catch clause variable declaration, just visit the block
        // the catch clause variable declaration has its own special scoping rules
        this.visitBlock(node.block);
    }

    public visitVariableDeclaration(node: ts.VariableDeclaration) {
        const propertyName = <ts.Identifier> node.name;
        const variableName = propertyName.text;
        const currentScope = this.getCurrentScope();
        const currentBlockScope = this.getCurrentBlockScope();

        // this const is shadowing if there's already a const of the same name in any available scope AND
        // it is not in the current block (those are handled by the 'no-duplicate-variable' rule)
        if (this.isVarInAnyScope(variableName) && currentBlockScope.varNames.indexOf(variableName) < 0) {
            this.addFailureOnIdentifier(propertyName);
        }

        // regular consts should always be added to the scope; block-scoped consts should be added iff
        // the current scope is same as current block scope
        if (!Lint.isBlockScopedVariable(node)
                || this.getCurrentBlockDepth() === 1
                || this.getCurrentBlockDepth() === this.getCurrentDepth()) {
            currentScope.varNames.push(variableName);
        }
        currentBlockScope.varNames.push(variableName);

        super.visitVariableDeclaration(node);
    }

    private isVarInAnyScope(varName: string) {
        return this.getAllScopes().some((scopeInfo) => scopeInfo.varNames.indexOf(varName) >= 0);
    }

    private addFailureOnIdentifier(ident: ts.Identifier) {
        const failureString = Rule.FAILURE_STRING + ident.text + "'";
        this.addFailure(this.createFailure(ident.getStart(), ident.getWidth(), failureString));
    }
}

class ScopeInfo {
    public varNames: string[] = [];
}
