(() => {
  const stage = document.getElementById('stage');
  const video = document.getElementById('video');
  const snapshot = document.getElementById('snapshot');
  const canvas = document.getElementById('capture');
  const status = document.getElementById('status');
  const startButton = document.getElementById('start-camera');
  const captureButton = document.getElementById('take-photo');
  const stopButton = document.getElementById('stop-camera');
  const downloadLink = document.getElementById('download');
  let stream = null;
  let previousImageUrl = null;

  function setStatus(message) {
    status.textContent = message;
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    video.srcObject = null;
    stage.classList.remove('is-live');
    stopButton.disabled = true;
    captureButton.disabled = true;
    startButton.disabled = false;
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Este navegador não oferece acesso à câmera. Tente um navegador atualizado em HTTPS.');
      return;
    }
    startButton.disabled = true;
    setStatus('Aguardando sua permissão para usar a câmera…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      stage.classList.remove('has-photo');
      stage.classList.add('is-live');
      downloadLink.hidden = true;
      captureButton.disabled = false;
      stopButton.disabled = false;
      setStatus('Câmera ativa neste navegador. Nenhuma imagem está sendo enviada.');
    } catch (error) {
      stopCamera();
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setStatus('Acesso negado. Permita o uso da câmera nas configurações do navegador e tente novamente.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setStatus('Não encontrei uma câmera conectada a este dispositivo.');
      } else {
        setStatus('Não foi possível iniciar a câmera. Verifique a permissão e tente novamente.');
      }
    }
  }

  function takePhoto() {
    if (!stream || !video.videoWidth || !video.videoHeight) {
      setStatus('Aguarde a pré-visualização da câmera e tente novamente.');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    if (previousImageUrl) URL.revokeObjectURL(previousImageUrl);
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus('Não consegui criar o retrato. Tente novamente.');
        return;
      }
      previousImageUrl = URL.createObjectURL(blob);
      snapshot.src = previousImageUrl;
      stage.classList.remove('is-live');
      stage.classList.add('has-photo');
      downloadLink.href = previousImageUrl;
      downloadLink.hidden = false;
      setStatus('Retrato capturado localmente. Você pode baixá-lo ou tirar outro.');
    }, 'image/png');
  }

  startButton.addEventListener('click', startCamera);
  captureButton.addEventListener('click', takePhoto);
  stopButton.addEventListener('click', () => {
    stopCamera();
    setStatus('Câmera desligada. O retrato capturado continua disponível para baixar.');
  });
  window.addEventListener('pagehide', () => {
    stopCamera();
    if (previousImageUrl) URL.revokeObjectURL(previousImageUrl);
  });
})();
