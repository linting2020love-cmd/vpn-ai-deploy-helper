export enum VpnProtocol {
  WIREGUARD = 'WireGuard',
  OPENVPN = 'OpenVPN',
  TAILSCALE = 'Tailscale (Easy)',
  SHADOWSOCKS = 'Shadowsocks'
}

export enum ServerOS {
  UBUNTU = 'Ubuntu 22.04/24.04',
  DEBIAN = 'Debian 11/12',
  DOCKER = 'Docker Container'
}

export enum ClientOS {
  WINDOWS = 'Windows',
  MACOS = 'macOS',
  IOS = 'iOS/iPadOS',
  ANDROID = 'Android'
}

export interface UserPreferences {
  protocol: VpnProtocol;
  serverOS: ServerOS;
  clientOS: ClientOS;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
