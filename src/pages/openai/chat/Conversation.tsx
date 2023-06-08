import { useLocation, useParams } from "react-router-dom";

function Conversation() {
  const localtion = useParams();
  console.log(localtion);
  return <div>Conversation</div>;
}

export default Conversation;
