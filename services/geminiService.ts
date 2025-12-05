import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserPreferences, VpnProtocol, ServerOS, ClientOS } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVpnGuide = async (prefs: UserPreferences): Promise<AsyncGenerator<string, void, unknown>> => {
  const ai = getClient();
  
  const systemInstruction = `
    你是一位专业的网络安全工程师和系统管理员。
    你的任务是提供一份详尽的、循序渐进的搭建安全 VPN 的技术指南。
    
    请遵循以下规则：
    1. 专注于隐私和安全的技术实现。
    2. 提供服务器设置的实际 Shell 命令。
    3. 解释关键配置文件（如 wg0.conf 或 server.conf）。
    4. 包含客户端配置步骤。
    5. 简洁但透彻。使用 Markdown 格式。
    6. 包含简短的“先决条件”部分（例如：具有公网 IP 的 VPS）。
    7. 添加关于遵守当地 VPN 使用法律的简短免责声明。
    8. **输出内容必须使用中文。**
  `;

  const prompt = `
    创建一个详细的 VPN 搭建指南，规格如下：
    - 协议：${prefs.protocol}
    - 服务器操作系统：${prefs.serverOS}
    - 主要客户端设备：${prefs.clientOS}

    指南结构需符合逻辑：
    1. 简介与先决条件
    2. 服务器安装命令
    3. 服务器配置（密钥生成、配置文件）
    4. 防火墙/网络设置（UFW、IP 转发）
    5. 针对 ${prefs.clientOS} 的客户端配置
    6. 验证与故障排除
  `;

  let lastError: any;
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3, // Low temperature for precise technical instructions
        }
      });

      async function* generator() {
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            yield text;
          }
        }
      }

      return generator();

    } catch (error: any) {
      lastError = error;
      
      // Analyze error for 503 / Overloaded status
      const errString = JSON.stringify(error) + (error.message || '');
      const isOverloaded = 
        errString.includes('503') || 
        errString.includes('overloaded') || 
        errString.includes('UNAVAILABLE') ||
        (error.status === 503) ||
        (error.code === 503);

      if (isOverloaded && attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s... + random jitter
        const backoffTime = Math.pow(2, attempt + 1) * 1000 + (Math.random() * 1000);
        console.warn(`Gemini API overloaded (503). Retrying in ${Math.round(backoffTime)}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await delay(backoffTime);
        continue;
      }
      
      throw error;
    }
  }

  throw lastError;
};
