import React, { useEffect, useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { BsDashLg } from "react-icons/bs";
import mqtt from "mqtt";

import { sentMessage } from "../services/rasaServices";

const MQTT_RASA_Bridge = () => {
  const [mess, setMess] = useState([]);
  const [mqttClient, setMqttClient] = useState(null);
  const [value, setValue] = useState("");
  const chatHistoryRef = useRef();

  const handleValue = (value) => {
    setValue(value);
  };

  const handle = (message) => {
    setMess((prevMess) => [
      ...prevMess,
      { text: message.value, sender: message.id ,isText:message.isText},
    ]);
  };
  useEffect(() => {
    const mqttBroker = "ws://192.168.8.19:9001"; // Thay đổi địa chỉ MQTT broker nếu cần
    const client = mqtt.connect(mqttBroker);

    client.on("connect", () => {
      // console.log("Connected to MQTT broker");
      client.subscribe(`rasa/response`);
      setMqttClient(client);
    });

    client.on("message", (topic, message) => {
     
      const inputString = message.toString();

      // Loại bỏ ký tự `{` và `}` từ chuỗi
      const trimmedString = inputString.slice(1, -1);

      // Chia chuỗi thành mảng các cặp key-value
      const keyValuePairs = trimmedString.split(",");

      // Tạo đối tượng từ mảng key-value
      const resultObject = keyValuePairs.reduce((acc, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = value;
        return acc;
      }, {});

      if (resultObject.id === "user") {
        const params = {
          message: resultObject.value,
        };
        sentMessage(
          params,
          (res) => {
            res.data.forEach((item)=> {
              if(item.text){
                const formattedMessage = `{value=${item.text},id=bot}`;
                const formattedMessageT = { value: item.text, id: "bot",isText:true };
                client.publish(`rasa/response`, formattedMessage);
                handle(formattedMessageT);
              }else{
                const formattedMessage = `{value=${item.image},id=bot}`;
                const formattedMessageT = { value: item.image, id: "bot",isText:false };
                client.publish(`rasa/response`, formattedMessage);
                handle(formattedMessageT);
              }
            })
            
          },
          (err) => {
            console.log(err);
          }
        );
      }
    });

    // Cleanup the MQTT client when the component unmounts
    return () => {
      client.end();
    };
  }, []);
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [mess]);
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Người dùng ấn phím "Enter", gửi tin nhắn
      if (mqttClient && mqttClient.connected && value.trim() !== "") {
        // Đảm bảo định dạng JSON nhất quán
        const formattedMessage = `{value=${value.toString()},id=user}`;
        const formattedMessageT = { value: value, id: "user",isText:true};
        mqttClient.publish(`rasa/response`, formattedMessage);
        handle(formattedMessageT);
        setValue("");
      }
    }
  };
  const publishMessage = (value) => {
    if (mqttClient && mqttClient.connected && value.trim() !== "") {
      // Đảm bảo định dạng JSON nhất quán
      const formattedMessage = `{value=${value.toString()},id=user}`;
      const formattedMessageT = { value: value, id: "user",isText:true };
      mqttClient.publish(`rasa/response`, formattedMessage);
      handle(formattedMessageT);
      setValue("");
    }
  };

  return (
    <div className="chat1">
      <div className={`chat`}>
        <div className="chat-header">
          <div className="chat-title">
            <img
              src="https://scontent.xx.fbcdn.net/v/t1.30497-1/143086968_2856368904622192_1959732218791162458_n.png?stp=dst-png_p100x100&_nc_cat=1&ccb=1-7&_nc_sid=db1b99&_nc_eui2=AeFX5JER1T-hUgp40eEfWzS2so2H55p0AlGyjYfnmnQCUUiS0k3AiFTbEKP_NS4T6nFxgs0kLY_wlp-ZbDu9rjfV&_nc_ohc=FaPLa6I4CdUAX8BdIwK&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=00_AfB5Ri94PG3vCu_NpkcauO6deYa-_28Hh9spQDOm-tGhdg&oe=65BC2178"
              alt=""
            />
            <div className="chat-name">
              <p>Rasa</p>
              <span>Đang hoạt động</span>
            </div>
          </div>
          <div className="chat-icon">
            <BsDashLg />
            <IoMdClose />
          </div>
        </div>
        <div className="chat-history" ref={chatHistoryRef}>
          {mess.map((message, index) => {
            return (
              <div
                key={index}
                className={
                  message.sender === "user" ? "user-message" : "bot-message"
                }
              >
              {message.isText ? <p>{message.text}</p> : <img src={message.text} alt=""/>}
                {/* {message.sender === "user" ? "You: " : "Bot: "} */}
              </div>
            );
          })}
        </div>
        <div className="chat-input">
          <input
            value={value}
            onChange={(e) => handleValue(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e)}
          />

          <svg
            className={`${value === "" ? "chat-ok" : "chat-send"}`}
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
            onClick={() => publishMessage(value)}
          >
            <title>Nhấn Enter để gửi</title>
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MQTT_RASA_Bridge;
