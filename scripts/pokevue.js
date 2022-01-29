window.addEventListener('load',()=>{
    const pokevue=Vue.createApp({
        data(){
            return {
                pokemons:[],
                range:8,
                currentPage:0,
                coloresDeTipo:coloresDeTipo,
                pokemonId:-1,
                pokemon:null,
                comment:{
                    content:'',
                    id:-1
                },
                editing:false,
                pokemonName:'',
                searchStatus:'',
                operation:'Add',
                comments:[]
            }
        },
        methods:{
            listPokemons: async function(){
                const response= await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${this.range}&offset=${this.currentPage * this.range}`);
                const pokemonList= Object.values( await response.json())[3];
                await this.fetchPokemons(pokemonList);
            },
            fetchPokemons: async function(pokemonList){
                let pokemons=Array();
                for(let i=0; i<pokemonList.length;i++){
                    let response= await fetch(pokemonList[i].url);
                    pokemons.push(await response.json());
                }
                this.pokemons=pokemons;
            },
            nextPage: function(){
                this.currentPage++;
                this.listPokemons();
            },
            lastPage: function(){
                if(this.currentPage>0){
                    this.currentPage--;
                    this.listPokemons();
                }
            },
            searchPokemonByName: function(event){
                event.preventDefault();
                this.editing=false;
                this.pokemon=null;
                this.searchStatus='searching';
                this.fetchPokemon(this.pokemonName.toLowerCase());
            },
            fetchPokemon: async function(identifier){
                let pokemon=null;
                this.comment.content='';
                const response= await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
                if(response.status===404){
                    this.searchStatus='not found';
                }else if(response.status===200){
                    this.searchStatus='found';
                    pokemon=  await response.json();
                }
                this.pokemon=pokemon;
                if(this.comment.content=='')
                    this.comment.content='There is not comment yet. \nClick here to add a comment';
                this.loadComment();
            },
            searchPokemon: function(identifier){
                this.pokemon=null;
                this.pokemonName='';
                this.fetchPokemon(identifier);
            },
            setSelectedPokemon: function(){
                this.pokemon=this.searchPokemon(this.pokemonId);
            },
            getSprite: function(){
                if(this.pokemon && this.pokemon.sprites.other.home.front_default)
                    return this.pokemon.sprites.other.home.front_default;
                else if(this.searchStatus=='')
                    return '/assets/icons/pokedex-default.png';
                else
                    return '/assets/icons/not-found-image.png';
            },
            getSpriteC: function(sprite){
                if(sprite)
                    return sprite;
                else
                    return '/assets/icons/not-found-image.png';
            },
            getColor: function(){
                if(this.pokemon)
                return coloresDeTipo.get(this.pokemon.types[0].type.name)
                else
                return'white';
            },
            resetPokedex: function(){
                this.pokemon=null;
                this.pokemonName='';
                this.searchStatus='';
                this.editing=false;
            },
            updateLocalStorage: function(){
                localStorage.setItem('pokevue.comments',JSON.stringify(this.comments));
            },
            addComment: function(){
                this.comment.id=this.pokemon.id;
                this.comments.push(this.comment);
                this.updateLocalStorage();
                this.loadComments();
            },
            updateComment: function(){
                for(let i=0;i<this.comments.length;i++){
                    if(this.comments[i].id==this.pokemon.id)
                        this.comments[i].content=this.comment.content;
                }
                this.updateLocalStorage();
            },
            performCommentOp: function(event){
                event.preventDefault();
                if(this.operation=='Add' && this.comment.content!='')
                    this.addComment();
                else if(this.operation=='Update')
                    this.updateComment();
                this.loadComment();
                this.editing=false;
            },
            loadComment: function(){
                for(let i=0;i<this.comments.length;i++){
                    if(this.comments[i].id==this.pokemon.id){
                        this.comment.content=this.comments[i].content;
                        this.operation='Update';
                        return;
                    }
                }
                this.operation='Add';
            },
            loadComments: function(){
                this.comments=JSON.parse(localStorage.getItem('pokevue.comments'));
            },
            editComment: function(){
                if(this.comment.content=='There is not comment yet. \nClick here to add a comment')
                    this.comment.content='';
                this.editing=true;
            }
        },
        created(){
            this.listPokemons();
            if(localStorage.getItem('pokevue.comments')){
                this.loadComments();
            }
        }
    })
    pokevue.mount('#pokevue');
});