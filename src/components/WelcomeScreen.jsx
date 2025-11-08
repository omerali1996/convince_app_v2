useEffect(() => {
    // Ses dosyasını yükle
    keySoundRef.current = new Audio("/sounds/mechanical-key.mp3");
    keySoundRef.current.preload = "auto";

    let interval;
    // Animasyon başlamadan önce kısa bir gecikme (başlık animasyonunun bitmesi için)
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;
      
      interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));

          // Boşluk, satır sonu veya emoji değilse ve her 3 karakterde bir ses çal
          const currentChar = fullText[index];
          if (currentChar !== " " && currentChar !== "\n" && currentChar.trim() !== "" && index % 3 === 0) {
            playKeySound();
          }

          index++;
        } else {
          setIsComplete(true);
          setIsTyping(false);
          clearInterval(interval);
          
          // Yazı bittikten sonra butonu göster
          setTimeout(() => {
            setShowButton(true);
          }, 500);
        }
      }, 500); // 500ms - çok yavaş ve sakin tempo
    }, 1200); // Başlık animasyonu için 1.2 saniye bekle

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);
