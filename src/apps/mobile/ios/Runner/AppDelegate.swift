import Flutter
import UIKit
import CoreImage

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)

    guard let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "QrReaderPlugin") else { return }
    let messenger = registrar.messenger()
    let channel = FlutterMethodChannel(name: "furnigo/qr_reader", binaryMessenger: messenger)

    channel.setMethodCallHandler { (call, result) in
      guard call.method == "detectQrCode",
            let args = call.arguments as? [String: Any],
            let path = args["path"] as? String else {
        result(FlutterMethodNotImplemented)
        return
      }

      guard let image = CIImage(contentsOf: URL(fileURLWithPath: path)) else {
        result(nil)
        return
      }

      let detector = CIDetector(ofType: CIDetectorTypeQRCode, context: nil, options: [CIDetectorAccuracy: CIDetectorAccuracyHigh])
      let features = detector?.features(in: image) as? [CIQRCodeFeature] ?? []
      let value = features.first?.messageString
      result(value)
    }
  }
}
