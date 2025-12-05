import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Server, Laptop, Network, ChevronRight, RefreshCw, Lock } from './components/Icons';
import SelectionCard from './components/SelectionCard';
import MarkdownRenderer from './components/MarkdownRenderer';
import { generateVpnGuide } from './services/geminiService';
import { VpnProtocol, ServerOS, ClientOS, UserPreferences } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    protocol: VpnProtocol.WIREGUARD,
    serverOS: ServerOS.UBUNTU,
    clientOS: ClientOS.WINDOWS
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [guideContent, setGuideContent] = useState<string>("");
  const guideEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    guideEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isGenerating) {
      scrollToBottom();
    }
  }, [guideContent, isGenerating]);

  const handleStartGeneration = async () => {
    setStep(4); // Move to guide view
    setIsGenerating(true);
    setGuideContent("");

    try {
      const stream = await generateVpnGuide(prefs);
      for await (const chunk of stream) {
        setGuideContent(prev => prev + chunk);
      }
    } catch (error) {
      console.error("Error generating guide:", error);
      setGuideContent("与 AI 通信时发生错误。请检查您的 API 密钥并重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setGuideContent("");
  };

  const renderStep1_Protocol = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">选择 VPN 协议</h2>
        <p className="text-slate-400">选择用于安全连接的底层技术。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectionCard
          title="WireGuard"
          description="现代、极速且精简。适合大多数追求性能和简洁的用户。"
          icon={<Network />}
          selected={prefs.protocol === VpnProtocol.WIREGUARD}
          onClick={() => setPrefs({ ...prefs, protocol: VpnProtocol.WIREGUARD })}
        />
        <SelectionCard
          title="OpenVPN"
          description="行业标准的传统协议。配置高度灵活，即便在严格的防火墙下也能工作。"
          icon={<Lock />}
          selected={prefs.protocol === VpnProtocol.OPENVPN}
          onClick={() => setPrefs({ ...prefs, protocol: VpnProtocol.OPENVPN })}
        />
        <SelectionCard
          title="Tailscale (简易)"
          description="基于 WireGuard 的零配置网格 VPN。设置最简单，无需端口转发。"
          icon={<ShieldCheck />}
          selected={prefs.protocol === VpnProtocol.TAILSCALE}
          onClick={() => setPrefs({ ...prefs, protocol: VpnProtocol.TAILSCALE })}
        />
        <SelectionCard
          title="Shadowsocks"
          description="一种安全的 Socks5 代理，专为保护网络流量而设计。轻量且高效。"
          icon={<Server />}
          selected={prefs.protocol === VpnProtocol.SHADOWSOCKS}
          onClick={() => setPrefs({ ...prefs, protocol: VpnProtocol.SHADOWSOCKS })}
        />
      </div>
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-cyan-900/20"
        >
          下一步 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2_ServerOS = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">选择服务器操作系统</h2>
        <p className="text-slate-400">您的 VPN 服务器将托管在哪里？</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectionCard
          title="Ubuntu 22.04/24.04"
          description="VPS 最流行的 Linux 发行版。推荐初学者使用。"
          icon={<Server />}
          selected={prefs.serverOS === ServerOS.UBUNTU}
          onClick={() => setPrefs({ ...prefs, serverOS: ServerOS.UBUNTU })}
        />
        <SelectionCard
          title="Debian 11/12"
          description="稳定、轻量，作为服务器极其可靠。"
          icon={<Server />}
          selected={prefs.serverOS === ServerOS.DEBIAN}
          onClick={() => setPrefs({ ...prefs, serverOS: ServerOS.DEBIAN })}
        />
        <SelectionCard
          title="Docker Container"
          description="隔离环境。非常适合保持宿主系统清洁。"
          icon={<Server />}
          selected={prefs.serverOS === ServerOS.DOCKER}
          onClick={() => setPrefs({ ...prefs, serverOS: ServerOS.DOCKER })}
        />
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-4 py-2">返回</button>
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-cyan-900/20"
        >
          下一步 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep3_ClientOS = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">选择主要客户端设备</h2>
        <p className="text-slate-400">您主要使用哪种设备进行连接？</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectionCard
          title="Windows"
          description="Windows 10/11 台式机或笔记本。"
          icon={<Laptop />}
          selected={prefs.clientOS === ClientOS.WINDOWS}
          onClick={() => setPrefs({ ...prefs, clientOS: ClientOS.WINDOWS })}
        />
        <SelectionCard
          title="macOS"
          description="MacBook Air, Pro 或 iMac。"
          icon={<Laptop />}
          selected={prefs.clientOS === ClientOS.MACOS}
          onClick={() => setPrefs({ ...prefs, clientOS: ClientOS.MACOS })}
        />
        <SelectionCard
          title="iOS / iPadOS"
          description="iPhone 或 iPad 移动设备。"
          icon={<Laptop />}
          selected={prefs.clientOS === ClientOS.IOS}
          onClick={() => setPrefs({ ...prefs, clientOS: ClientOS.IOS })}
        />
        <SelectionCard
          title="Android"
          description="Android 手机或平板。"
          icon={<Laptop />}
          selected={prefs.clientOS === ClientOS.ANDROID}
          onClick={() => setPrefs({ ...prefs, clientOS: ClientOS.ANDROID })}
        />
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white px-4 py-2">返回</button>
        <button
          onClick={handleStartGeneration}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-xl shadow-cyan-900/30"
        >
          生成指南
        </button>
      </div>
    </div>
  );

  const renderGuide = () => (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg"><Server /></span>
            {prefs.protocol} 搭建指南
          </h2>
          <div className="flex gap-4 mt-2 text-sm text-slate-400">
            <span>服务器: <span className="text-slate-200">{prefs.serverOS}</span></span>
            <span>•</span>
            <span>客户端: <span className="text-slate-200">{prefs.clientOS}</span></span>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重新开始
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative bg-slate-900/50 rounded-xl border border-slate-800 p-6 shadow-inner">
        {guideContent ? (
          <MarkdownRenderer content={guideContent} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
             <p className="text-cyan-400 font-mono animate-pulse">正在初始化神经网络...</p>
          </div>
        )}
        {isGenerating && guideContent && (
           <div className="flex items-center gap-2 mt-4 text-cyan-400 text-sm font-mono animate-pulse">
             <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
             AI 架构师正在输入...
           </div>
        )}
        <div ref={guideEndRef} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center bg-no-repeat bg-fixed">
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh]">
        
        {/* Sidebar */}
        <div className="hidden lg:flex lg:col-span-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg leading-tight">VPN 架构师</h1>
                <span className="text-xs text-cyan-400 font-mono">v1.0.0 AI</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step === 1 ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-500'}`}>
                <span className="text-sm font-medium">1. 协议</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step === 2 ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-500'}`}>
                <span className="text-sm font-medium">2. 服务器系统</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step === 3 ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-500'}`}>
                <span className="text-sm font-medium">3. 客户端设备</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step === 4 ? 'bg-slate-800 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-500'}`}>
                <span className="text-sm font-medium">4. 安装指南</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-xs text-slate-400 border border-slate-700/50">
            <p className="mb-2 font-semibold text-slate-300">免责声明</p>
            <p>请确保您遵守当地关于使用 VPN 的法律法规。</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 lg:col-span-9 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            {step === 1 && renderStep1_Protocol()}
            {step === 2 && renderStep2_ServerOS()}
            {step === 3 && renderStep3_ClientOS()}
            {step === 4 && renderGuide()}
        </div>

      </div>
    </div>
  );
};

export default App;