import { GeneralChat } from "@chaingpt/generalchat";
import { SmartContractAuditor } from "@chaingpt/smartcontractauditor";
import { SmartContractGenerator } from "@chaingpt/smartcontractgenerator"

export class ChainGPTClient {
    private chatClient: GeneralChat;
    private apiKey: string;
    private auditorClient: SmartContractAuditor;
    private generatorClient: SmartContractGenerator;

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_CHAINGPT_API_KEY!;
        this.chatClient = new GeneralChat({
            apiKey: this.apiKey
        });
        this.auditorClient = new SmartContractAuditor({
            apiKey: this.apiKey,
        });
        this.generatorClient = new SmartContractGenerator({
            apiKey: this.apiKey
        })
    }

    async chat(question: string, userId?: string) {
        return await this.chatClient.createChatStream({
            question,
            chatHistory: userId ? "on" : "off",
            sdkUniqueId: userId || undefined,
        });
    }

    async auditContract(contractCode: string, userId?: string) {
        return await this.auditorClient.auditSmartContractStream({
            question: contractCode,
            chatHistory: userId ? "on" : "off",
            sdkUniqueId: userId || undefined
        })
    }

    async generateContract(description: string, userId?: string) {
        return await this.generatorClient.createSmartContractStream({
            question: description,
            chatHistory: userId ? "on" : "off",
            sdkUniqueId: userId || undefined
        })
    }

    async *streamToText(stream: ReadableStream<Uint8Array>) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                yield chunk;
            }
        } finally {
            reader.releaseLock();
        }
    }
}

export const chainGPTClient = new ChainGPTClient();