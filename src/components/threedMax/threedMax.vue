<template>
  <div class="three-max" >
    <div id="tmbox">
    </div>
    <progress-bar v-if="showProgress" class="progress" type="circle" color="#007AFF" ref="progress" :options="pgOptions"></progress-bar>
  </div>
</template>
<script>
import THREE from './threejs/all'

export default {
  data () {
    return {
      scene : 0,
      camera : 0,
      renderer : 0,
      controls : 0,
      objGroup : 0,
      state : 0,
      renderCount : 0,
      _w:414,
      _h:325,
      senceBg :require("../../assets/3dmax/3d-max-bg-black.png"),
      testBg:require("../../assets/3dmax/time.jpg"),
      bgImg:require('../../images/bg.jpg'),
      showProgress:false,
      pgOptions: {
        color: '#00744c',
        strokeWidth: 4,
        trailWidth: 1,
        from: { color: '#aaa', width: 1 },
        to: { color: '#333', width: 4 },
        fill: 'rgba(255, 255, 255, 0.5)',
      },
      threeDModelProp:null,
    }
  },
  props:{
    objUrl:null,
    mtlUrl:null,
    tdProp:null,
    MetalMat:null
  },
  created(){
    this.threeDModelProp =JSON.parse(this.tdProp);
    console.log(this.objUrl);
  },
  mounted(){
    var tmbox = document.getElementById("tmbox");
    this._w = tmbox.clientWidth;
    this._h = tmbox.clientHeight;
    this.initScene();
    this.render();
    this.animate();
    this.showProgress = true;
  },
  methods: {
    initScene : function() {
        var scene = new THREE.Scene();
        scene.background = new THREE.TextureLoader().load(this.senceBg);

        var ambientLight = new THREE.AmbientLight(0xffffff, 1)
        ambientLight.position.set(0, 40, 60).normalize(); /*光源位置*/
        scene.add(ambientLight); /*添加环境光*/


        var pointLight = new THREE.PointLight(0xffffff, 0.35, 90,2);
        pointLight.position.set(0, 8, 20);
        scene.add(pointLight);

        // var pointLight1 = new THREE.PointLight(0xffffff, 0.8, 100);
        // pointLight.position.set(0, 8, -20);
        // scene.add(pointLight1);

                // var pointLight = new THREE.PointLight(0xffffff, 0.2)
                // pointLight.position.set(0, 16, 30).normalize(); /*光源位置*/
                // scene.add(pointLight); /*添加环境光*/


                // var pointLight1 = new THREE.PointLight(0xffffff, 0.2)
                // pointLight1.position.set(0, 16, -30).normalize(); /*光源位置*/
                // scene.add(pointLight1); /*添加环境光*/


                // var directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.35); /*定向光源*/
                // directionalLight1.position.set(0, 5, 20).normalize(); /*光源位置*/
                // scene.add(directionalLight1); /*添加光源到场景*/

                // var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.35); /*定向光源*/
                // directionalLight2.position.set(0, 5, -20).normalize(); /*光源位置*/
                // scene.add(directionalLight2); /*添加光源到场景*/


                // var directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.35); /*定向光源*/
                // directionalLight3.position.set(0, -50, 0).normalize(); /*光源位置*/
                // scene.add(directionalLight3); /*添加光源到场景*/


                // var directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.35); /*定向光源*/
                // directionalLight4.position.set(0, 50, 0).normalize(); /*光源位置*/
                // scene.add(directionalLight4); /*添加光源到场景*/


                // var directionalLight5 = new THREE.DirectionalLight(0xffffff, 0.35); /*定向光源*/
                // directionalLight5.position.set(-80, 5, 0).normalize(); /*光源位置*/
                // scene.add(directionalLight5); /*添加光源到场景*/


                // var directionalLight6 = new THREE.DirectionalLight(0xffffff, 0.35); /*定向光源*/
                // directionalLight6.position.set(80, 5, 0).normalize(); /*光源位置*/
                // scene.add(directionalLight6); /*添加光源到场景*/




        this.scene = scene;
        // this.stat = new Stats(); //实例化stat
        // this.stat.domElement.style.position = 'absolute';
        // this.stat.domElement.style.right = '0px';
        // this.stat.domElement.style.top = '0px';
        // document.body.appendChild(stat.domElement);

        this.initCamera();
        this.initObject();
        this.initRenderer();
        this.initControl();
    },
    initCamera : function() {
      /*
        PerspectiveCamera( fov, aspect, near, far )
        fov — 相机视锥体垂直视角
        aspect — 相机视锥体宽高比
        near — 相机视锥体近裁剪面
        far — 相机视锥体远裁剪面。
      */
        var cameraProp =this.threeDModelProp.camera;
        var camera = new THREE.PerspectiveCamera(cameraProp.Fov*1, this._w / this._h, cameraProp.Near*1, cameraProp.Far*1); /*镜头*/
        camera.position.set(cameraProp.position.x*1, cameraProp.position.y*1, cameraProp.position.z*1);
        camera.rotation.x = cameraProp.rotation.x*1;
        camera.rotation.y = cameraProp.rotation.y*1;
        camera.rotation.z = cameraProp.rotation.z*1;
        camera.castShadow = true;
        camera.lookAt(this.scene.position);
        this.camera  = camera;
        this.scene.add(this.camera);
    },
    initRenderer : function() {
        this.renderer = new THREE.WebGLRenderer(); /*渲染器*/
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this._w, this._h);
        var container = document.getElementById('tmbox');
        /*加载渲染*/
        container.appendChild(this.renderer.domElement);
    },
    initObject : function() {
      var _this = this;
        /*加载进度回调*/
        var _loader = {
            onProgress: function(xhr) {
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    var percent = Math.round(percentComplete, 2);
                      if(_this.$refs.progress)
                      {
                        _this.$refs.progress.setText(percent + "%");_this.$refs.progress.set(percent/100);
                      }
                    if (percent >= 100) {
                        _this.showProgress = false;
                    }
                }
            },
            onError: function(xhr) {
                console.log('加载出现异常，请刷新重试');
            }
        }

        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
        var mtlLoader = new THREE.MTLLoader(); /*初始化3dmax导出文件mtl加载器*/
        mtlLoader.setBaseUrl('/images/');
        //mtlLoader.setPath(_this.mtlUrl); /*设置文件路径*/
        mtlLoader.load(_this.mtlUrl,function(materials) { /*加载材质文件*/
            //materials.preload(); /*材质预加载*/
            var objLoader = new THREE.OBJLoader(); /*初始化obj文件加载器*/

            objLoader.setMaterials(materials); /*设置模型材质*/
            //objLoader.setPath('3dmax/mx5/'); /*设置文件路径*/
            objLoader.load(_this.objUrl, function(object) { /*加载模型文件*/
                object.position.y = 0; /*设置模型初始化位置*/
                object.position.z = 0; /*设置模型初始化位置*/
                object.position.x = 0; /*设置模型初始化位置*/
                object.scale.x = 1;
                object.scale.y = 1;
                object.scale.z = 1;
                object.rotation.x = 0;
                object.rotation.y = 0;
                object.rotation.z = 0;
                var objProp = _this.threeDModelProp.object;
                _this.objGroup = new THREE.Object3D();
                _this.objGroup.position.set(objProp.position.x*1, objProp.position.y*1,objProp.position.z*1);
                var _scale = objProp.scale*1;
                _this.objGroup.scale.set(_scale,_scale,_scale);
                _this.objGroup.rotation.set(objProp.rotation.x*1, objProp.rotation.y*1,objProp.rotation.z*1);
                _this.objGroup.add(object);

                var _btexture = THREE.ImageUtils.loadTexture(_this.bgImg);
                _btexture.mapping = THREE.SphericalReflectionMapping;


                var loader = new THREE.CubeTextureLoader();
                loader.setPath('');
                var imgs = [];
                for(var i = 0;i<6;i++){
                    imgs.push(_this.MetalMat);
                }
                var textureCube = loader.load(imgs, THREE.CubeReflectionMapping);
                var metalMat = new THREE.MeshPhongMaterial({
                    color:   0xf7f7f7,
                    envMap: textureCube
                });

                // object.children.forEach(s=>{
                //     if(s.material.length>1){
                //         s.material.forEach(j=>{
                //             var _name = j.name;
                //             console.log(_name)
                //              if(!!_name && (_name.indexOf("blinn")>-1)){
                //                 var ring   = new THREE.Mesh(s.geometry, metalMat);
                //                 _this.objGroup.add(ring);
                //             }
                //         })
                //     }else{
                //         var _name = s.material.name;
                //         if(!!_name && (_name.indexOf("phong")>-1)){
                //                 var ring   = new THREE.Mesh(s.geometry, metalMat);
                //                 _this.objGroup.add(ring);
                //          }
                //     }
                // })

                object.children.map(function(s){
                    //  console.log(s.material)
                var _name = s.material.name;
                    if(!!_name && (_name.indexOf("phong")>-1)){
                        var ring   = new THREE.Mesh(s.geometry, metalMat);
                         _this.objGroup.add(ring);
                    }else{
                        var ring   = new THREE.Mesh(s.geometry, metalMat);
                         _this.objGroup.add(ring);
                    }
                });

                var reloadMesh = new function() {
                    var load = function(s, name, i, isMulti, isOver, callback) {
                        if (!!name) {
                            var m = materials.materials[name];
                            var mi = materials.materialsInfo[name];
                            if (!!mi.map_kd) {
                                var tloader = new THREE.TextureLoader();
                                var debug = false;
                                var debugUrl = debug?'http://dd-h5.oss-cn-beijing.aliyuncs.com/psbc_3dmodel/images/':'/images/';
                                var mUrl = mi.map_kd.indexOf("http") == 0 ? mi.map_kd : (debugUrl + mi.map_kd);
                                tloader.load(mUrl, function(texture) {
                                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                                    texture.repeat.set(1, 1);
                                    var _m = new THREE.MeshBasicMaterial({
                                        map: texture
                                    });
                                    _m.needsUpdate = true;
                                    if (!!isMulti) {
                                        s.material[i] = _m;
                                    } else {
                                        s.material = _m;
                                    }
                                    if (isOver) {
                                        callback();
                                    }
                                });
                            } else {
                                if (!!m) {
                                    m.needsUpdate = true;
                                    s.material = m;
                                }
                                if (isOver) {
                                    callback();
                                }
                            }
                        }
                    }

                    var start = function(callback) {
                        object.children.map(function(s, i) {
                            if (s.material instanceof Array) {
                                var __sm = s.material.filter(function(_s, ii) {
                                    return !!materials.materialsInfo[_s.name] && !!materials.materialsInfo[_s.name].map_kd;
                                });
                                var _sm_tmp = 0;
                                s.material.filter(function(_s, ii) {
                                    if (!!materials.materialsInfo[_s.name] && !!materials.materialsInfo[_s.name].map_kd) {
                                        _sm_tmp++;
                                        load(s, _s.name, ii, true, _sm_tmp == __sm.length, callback);
                                    }
                                })
                                return;
                            } else {
                                load(s, s.material.name, i, false, (i == object.children.length - 1), callback);
                            }
                        });
                    }
                    this.loaded = function(callback) {
                        start(callback || function() {
                            console.info('reloaded');
                        });
                    }
                }();
                reloadMesh.loaded(function() {
                    _this.scene.add(_this.objGroup); /*将模型添加入场景*/
                });


                // var trans = object.children.filter(s=> s.name == 'polySurface431 ZhongChao_3');
                // trans.map(function(s){
                //   s.material.opacity = 0.6;
                //   s.material.transparent = true;
                // });

            }, _loader.onProgress, _loader.onError);
        });

    },
    initControl : function() {
        this.controls = new THREE.OrbitControls(this.camera, document.getElementById("tmbox"), {
            enableRotateY: false,
            rotateMoveCallback: function(ctl) {
                ctl.autoRotate = false;
                clearTimeout(ctl.autoRotateTimer);
                ctl.autoRotateTimer = setTimeout(function() {
                    ctl.autoRotate = true;
                }, 10e3);
            }
        });
        this.controls.autoRotate = true; //设置平面自动旋转
        this.controls.autoRotateSpeed = 1;

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.8;

        this.controls.enablePan = true;
        this.controls.enableZoom = true;

        this.controls.enableRotate = true;
        this.controls.rotateSpeed = 0.5;

        this.controls.addEventListener('change', this.render);
    },
    render : function() {
        this.renderer.render(this.scene, this.camera);
    },
    animate : function () {
        if (this.renderCount === 0) {
            this.render();
        }
        requestAnimationFrame(this.animate);
        this.controls.update();
    }
  }
}
</script>
<style>
.three-max{
  width:100%;
  height:100%;
  position: relative;
}
#tmbox{
  width:100%;
  height:100%;
  position: relative;
}


.pgs {
    width: 100%;
    height: 5px;
    float: left;
    background-color: #ddd;
}

#pgsline {
    width: 0;
    float: left;
    height: 5px;
    background-color: #9d2932;
}


</style>
<style scoped>
.progress{
    width: 120px;
    height: 120px;
    line-height: 120px;
    background: none;
    margin: 0 auto;
    -webkit-box-shadow: none;
    box-shadow: none;
    position: absolute!important;
    z-index: 9999999;
    left: 50%;
    margin-left: -60px;
    top: 50%;
    margin-top: -60px;
  }
</style>
