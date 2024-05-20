const Test = () => {
  const decodeHTMLEntities = (text) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = text;
    return tempElement.textContent || tempElement.innerText || "";
  };
  let message = `I&#039;m here to help you with the US EB5 visa program. To begin, could you please share if you have considered any specific investment opportunities or if you have a preference for direct investment or investment through a Regional Center? Understanding your investment preferences will allow me to assess your eligibility for the EB-5 visa program. Let&#039;s discuss how your investment goals align with the program requirements.`;
  return <div>{decodeHTMLEntities(message)}</div>;
};

export default Test;
