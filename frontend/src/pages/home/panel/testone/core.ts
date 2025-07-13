
export const initConfig = {
  host: 'localhost',
  port: '17127'
};

// 默认机器人账号
export const initBot = {
  id: 0,
  UserId: '794161769',
  UserAvatar: 'https://q.qlogo.cn/headimg_dl?dst_uin=794161769&spec=100',
  UserName: '阿柠檬',
  OpenId: '794161769',
  IsBot: true
};

// 默认用户账号
export const initUser = {
  id: 1,
  UserId: '1715713638',
  UserAvatar: 'https://q.qlogo.cn/headimg_dl?dst_uin=1715713638&spec=100',
  UserName: '我自己',
  OpenId: '1715713638',
  IsBot: false
};

export const initChannel = {
  id: 1,
  GuildId: '123456',
  ChannelId: '123456',
  ChannelName: '机器人交流群',
  ChannelAvatar: 'https://alemonjs.com/img/alemon.png'
};

export const DATA = {
  stringify: (data: any) => JSON.stringify(data),
  parse: (data: string): any => JSON.parse(data)
};

/**
 * input
 * @param input
 * @returns
 */
export const parseHtmlContent = (input: string): string => {
  return input
    .replace(/\n/g, '<br>')
    .replace(/@([^\s#]+)/g, '<strong>@$1</strong>')
    .replace(/#([^\s@]+)/g, '<strong>#$1</strong>');
};

type ParseType = {
  Users: {
    UserId: string;
    UserName: string;
  }[];
  Channels: {
    ChannelId: string;
    ChannelName: string;
  }[];
  input: string;
};

/**
 * input 出来的产物
 * @param input
 * @returns
 */
export const parseMessageContent = ({
  Users,
  Channels,
  input
}: ParseType): string => {
  return (
    input
      .replace(/@([^\s#]+)/g, (match, name) => {
        // 替换 @开头的为 <@id>
        const user = Users.find(u => u.UserName === name);
        return user ? `<@${user.UserId}>` : match;
      })
      // 替换 #开头的为 <#id>
      .replace(/#([^\s@]+)/g, (match, name) => {
        // 替换 @开头的为 <@id>
        const channel = Channels.find(u => u.ChannelName === name);
        return channel ? `<#${channel.ChannelId}>` : match;
      })
  );
};

/**
 * 解析消息
 * @param msg
 * @returns
 */
export const parseMessage = (data: ParseType) => {
  const message = parseMessageContent(data);

  console.log('message', message);

  const bodies: any = [];

  const createMentions = (mentionPattern: RegExp) => {
    let lastIndex = 0;
    let match;

    while ((match = mentionPattern.exec(message)) !== null) {
      // 添加普通文本部分
      if (lastIndex < match.index) {
        const textValue = message.substring(lastIndex, match.index).trim();
        if (textValue) {
          bodies.push({ type: 'Text', value: textValue });
        }
      }

      const value = match[1].trim();
      const mentionType = match[0].startsWith('<@') ? 'user' : 'channel';

      bodies.push({
        type: 'Mention',
        value: value,
        options: {
          belong: value === 'everyone' ? 'everyone' : mentionType
        }
      });

      lastIndex = mentionPattern.lastIndex; // 更新索引
    }

    // 添加剩余文本
    if (lastIndex < message.length) {
      const remainingText = message.substring(lastIndex).trim();
      if (remainingText) {
        bodies.push({ type: 'Text', value: remainingText });
      }
    }
  };

  createMentions(/<[@#](.*?)>/g);

  return bodies;
};
