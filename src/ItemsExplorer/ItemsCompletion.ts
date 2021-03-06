import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    CompletionList,
    Position,
    TextDocument
} from 'vscode'

import { Item } from './Item'
import { ItemsModel } from './ItemsModel'
import * as _ from 'lodash'

/**
 * Produces a list of openHAB items completions
 * collected from REST API
 * 
 * Kuba Wolanin - Initial contribution
 */
export class ItemsCompletion implements CompletionItemProvider {

    constructor(private openhabHost: string) {
        if (!this.model) {
            this.model = new ItemsModel(this.openhabHost)
        }
    }

    private model: ItemsModel

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Thenable<CompletionItem[]> {
        return new Promise((resolve, reject) => {
            this.model.completions.then(completions => {
                resolve(completions.map((item: Item) => {
                    let completionItem = _.assign(new CompletionItem(item.name), {
                        kind: CompletionItemKind.Variable,
                        detail: item.type,
                        documentation: this.getDocumentation(item),
                    })

                    return completionItem
                }))
            })
        })
    }

    /**
     * Generates a documentation string for the IntelliSense auto-completion
     * Contains Item's label, state, tags and group names.
     * @param item openHAB Item
     */
    private getDocumentation(item: Item): string {
        let label = item.label ? item.label + ' ' : ''
        let state = item.state ? '(' + item.state + ')' : ''
        let tags = item.tags.length && 'Tags: ' + item.tags.join(', ')
        let groupNames = item.groupNames.length && 'Groups: ' + item.groupNames.join(', ')
        let documentation: string[] = [
            label + state,
            tags,
            groupNames
        ]

        return _.compact(documentation).join('\n')
    }
}
