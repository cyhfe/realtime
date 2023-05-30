{
  /* <div>私聊 to: {to}</div>
<div>聊天内容</div>

<div>
  {privateMessages &&
    privateMessages.map((m: any) => {
      return <div key={m.id}>{m.content}</div>;
    })}
</div>
<input type="text" ref={messageRef} />
<button
  onClick={() => {
    socketRef.current?.emit("chat/privateMessage", {
      content: messageRef.current.value,
      to,
    });
  }}
>
  发送
</button> */
}

function ChatIndex() {
  return <div>index</div>;
}

function ChatChanel() {
  return <div>chanel</div>;
}

function ChatPrivate() {
  return <div>private</div>;
}

export { ChatIndex, ChatChanel, ChatPrivate };
