export type Config = {
  // bot
  BotId: string;
  BotName: string;
  BotAvatar: string;
  // guild
  GuildId: string;
  ChannelId: string;
  ChannelName: string;
  ChannelAvatar: string;
};

export type User = {
  UserId: string;
  UserName: string;
  UserAvatar: string;
  OpenId: string;
  IsBot: boolean;
};

export type Channel = {
  GuildId: string;
  ChannelId: string;
  ChannelAvatar: string;
  ChannelName: string;
};
